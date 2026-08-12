import { Queue } from "bullmq";
import { getBullmqConnectionOptions } from "../ingest/bullmqRedis.js";
import { APIFY_SCRAPE_QUEUE_NAME } from "./constants.js";

let apifyScrapeQueue = null;

export function getApifyScrapeQueue() {
  if (!apifyScrapeQueue) {
    apifyScrapeQueue = new Queue(APIFY_SCRAPE_QUEUE_NAME, {
      connection: getBullmqConnectionOptions(),
    });
  }
  return apifyScrapeQueue;
}

export async function enqueueApifyScrapeCityJobs(cities) {
  if (!cities.length) return [];

  const jobs = cities.map((city) => ({
    name: "apify-scrape-city",
    data: { cityId: city.id, jobId: city.job_id },
    opts: {
      jobId: `apify-city-${city.id}`,
      attempts: 2,
      backoff: { type: "exponential", delay: 60_000 },
      removeOnComplete: 100,
      removeOnFail: 200,
    },
  }));

  return getApifyScrapeQueue().addBulk(jobs);
}

export async function closeApifyScrapeQueue() {
  if (apifyScrapeQueue) {
    await apifyScrapeQueue.close();
    apifyScrapeQueue = null;
  }
}
