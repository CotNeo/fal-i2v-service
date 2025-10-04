import { fal } from "@fal-ai/client";
import { logger } from "../utils/logger.js";

export const initFal = () => {
  const key = process.env.FAL_KEY;
  if (!key) {
    logger.error("FAL_KEY missing in environment");
    throw new Error("FAL_KEY is required");
  }
  fal.config({ credentials: key });
  logger.info("FAL client configured");
};

export const MODEL_ID = "fal-ai/ovi/image-to-video";

/**
 * Senkron (iş bitene kadar bekler)
 */
export async function runSyncI2V(input, { logs = true } = {}) {
  const result = await (await import("@fal-ai/client")).fal.subscribe(MODEL_ID, {
    input,
    logs,
    onQueueUpdate: (update) => {
      if (update.status === "IN_PROGRESS" && logs) {
        update.logs?.forEach((l) => console.log(l.message));
      }
    },
  });
  return result; // { data, requestId }
}

/**
 * Queue submit (tercih edilen) – webhookUrl ile
 */
export async function submitI2V(input, webhookUrl) {
  const { request_id } = await fal.queue.submit(MODEL_ID, {
    input,
    ...(webhookUrl ? { webhookUrl } : {}),
  });
  return request_id;
}

export async function getStatus(requestId, { logs = false } = {}) {
  return fal.queue.status(MODEL_ID, { requestId, logs });
}

export async function getResult(requestId) {
  return fal.queue.result(MODEL_ID, { requestId });
}

/**
 * Opsiyonel: Fal storage'a upload (Node 18+ Blob destekli)
 * Buffer/Blob/File -> URL döner
 */
export async function uploadToFalStorage(fileBuffer, fileName, mimeType) {
  const file = new File([fileBuffer], fileName, { type: mimeType });
  const url = await fal.storage.upload(file);
  return url; // public geçici URL
}
