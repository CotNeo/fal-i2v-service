import { Router } from "express";
import { logger } from "../utils/logger.js";

/**
 * Not: FAL webhook'ları için ek bir imza doğrulama bilgisi belgelerde yoksa,
 * IP allowlist veya gizli path kullanın (örn. /webhooks/fal/i2v?token=XYZ).
 * Prod’da geriye en az 200 OK dön.
 */
const router = Router();

router.post("/i2v", async (req, res) => {
  // FAL genelde { request_id, status, data? } gibi payload gönderir.
  const { request_id, status, data, error } = req.body || {};
  logger.info({ request_id, status, error, data }, "FAL I2V webhook received");

  // Burada sonucu DB'ye yazabilir, job tablosunu güncelleyebilirsin.
  // Örn: if (status === "COMPLETED") save data.video.url

  res.sendStatus(200);
});

export default router;
