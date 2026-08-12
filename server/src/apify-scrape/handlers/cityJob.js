import { createIngestGroup } from "../../ingest/db.js";
import { enqueueFilterJob } from "../../ingest/queues.js";
import {
  listRunDatasetItems,
  startActorRun,
  waitForActorRun,
} from "../apifyClient.js";
import { buildActorInput } from "../buildActorInput.js";
import {
  claimApifyScrapeCity,
  completeApifyScrapeCity,
  failApifyScrapeCity,
  getApifyScrapeCity,
  getApifyScrapeJob,
  markApifyScrapeJobRunning,
  refreshApifyScrapeJobProgress,
  setApifyScrapeCityRunId,
} from "../db.js";

async function resolveActorRun(city, { searchKeyword, maxPlaces }) {
  if (city.apify_run_id) {
    return waitForActorRun(city.apify_run_id);
  }

  const started = await startActorRun(
    buildActorInput({
      locationQuery: city.location_query,
      searchKeyword,
      maxPlaces,
    })
  );
  await setApifyScrapeCityRunId(city.id, started.id);

  return waitForActorRun(started.id);
}

export async function processApifyScrapeCityJob(job) {
  const { cityId } = job.data ?? {};
  if (!cityId) {
    throw new Error("apify scrape job missing cityId");
  }

  const existing = await getApifyScrapeCity(cityId);
  if (!existing) {
    throw new Error(`apify scrape city not found: ${cityId}`);
  }
  if (["completed", "failed"].includes(existing.status)) {
    return { cityId, status: existing.status, skipped: true };
  }

  const city = await claimApifyScrapeCity(cityId);
  if (!city) {
    return { cityId, skipped: true };
  }

  const parentJobId = city.job_id;

  try {
    await markApifyScrapeJobRunning(parentJobId);

    const parentJob = await getApifyScrapeJob(parentJobId);
    if (!parentJob) {
      throw new Error(`apify scrape job not found: ${parentJobId}`);
    }

    const run = await resolveActorRun(city, {
      searchKeyword: parentJob.search_keyword,
      maxPlaces: parentJob.max_places,
    });
    if (run.status !== "SUCCEEDED") {
      throw new Error(`Apify run finished with status ${run.status}`);
    }

    const items = await listRunDatasetItems(run.defaultDatasetId);
    if (items.length === 0) {
      throw new Error("Apify run returned no places");
    }

    const group = await createIngestGroup({
      name: city.location_query,
      payload: items,
    });
    await enqueueFilterJob(group.id);

    await completeApifyScrapeCity(cityId, {
      ingestGroupId: group.id,
      placeCount: items.length,
    });
    const refreshed = await refreshApifyScrapeJobProgress(parentJobId);

    return {
      cityId,
      jobId: parentJobId,
      jobStatus: refreshed.status,
      ingestGroupId: group.id,
      placeCount: items.length,
    };
  } catch (err) {
    const attempts = job.opts?.attempts ?? 1;
    const finalAttempt = (job.attemptsMade ?? 0) + 1 >= attempts;

    if (finalAttempt) {
      await failApifyScrapeCity(
        cityId,
        err?.message || "Apify city scrape failed"
      );
      await refreshApifyScrapeJobProgress(parentJobId);
    }

    throw err;
  }
}
