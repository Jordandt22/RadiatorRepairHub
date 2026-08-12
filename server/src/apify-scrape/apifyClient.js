import { ApifyClient } from "apify-client";
import { APIFY_RUN_TIMEOUT_SECS } from "./constants.js";

let client = null;

function getClient() {
  if (!client) {
    const token = process.env.APIFY_API_TOKEN;
    if (!token) throw new Error("APIFY_API_TOKEN is not configured");
    client = new ApifyClient({ token });
  }
  return client;
}

function getActorId() {
  const actorId = process.env.APIFY_GOOGLE_CRAWLER_ACTOR_ID;
  if (!actorId) {
    throw new Error("APIFY_GOOGLE_CRAWLER_ACTOR_ID is not configured");
  }
  return actorId;
}

export async function startActorRun(input) {
  return getClient()
    .actor(getActorId())
    .start(input, { timeout: APIFY_RUN_TIMEOUT_SECS });
}

export async function waitForActorRun(runId) {
  return getClient().run(runId).waitForFinish();
}

export async function listRunDatasetItems(datasetId) {
  const { items } = await getClient().dataset(datasetId).listItems();
  return items ?? [];
}
