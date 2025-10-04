import { Router } from "express";
import multer from "multer";
import { I2VInputSchema } from "../lib/validation.js";
import {
  runSyncI2V,
  submitI2V,
  getStatus,
  getResult,
  uploadToFalStorage,
} from "../lib/fal.js";
import { HttpError } from "../utils/errors.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

/**
 * POST /api/i2v/run-sync
 * İş bitene kadar bekler (daha kısa videolar ve admin kullanım için)
 * Body: { prompt, image_url, negative_prompt?, audio_negative_prompt?, num_inference_steps?, seed?, resolution? }
 */
router.post("/run-sync", async (req, res, next) => {
  try {
    const parsed = I2VInputSchema.parse(req.body);
    const result = await runSyncI2V(parsed, { logs: true });
    // result.data => { video: { url }, seed, ... }
    res.json({ requestId: result.requestId, ...result.data });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/i2v/submit
 * Queue + webhook (önerilen)
 * Body aynı; .env: PUBLIC_BASE_URL gerekli (webhook hedefi için)
 */
router.post("/submit", async (req, res, next) => {
  try {
    const parsed = I2VInputSchema.parse(req.body);

    const webhookUrl = `${process.env.PUBLIC_BASE_URL}/webhooks/fal/i2v`;
    const requestId = await submitI2V(parsed, webhookUrl);

    res.status(202).json({ requestId, status: "SUBMITTED", webhookUrl });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/i2v/submit-upload
 * Form-Data ile resim upload + queue
 * fields: prompt, ... + file: image
 */
router.post("/submit-upload", upload.single("image"), async (req, res, next) => {
  try {
    const {
      prompt,
      negative_prompt,
      audio_negative_prompt,
      num_inference_steps,
      seed,
      resolution,
    } = req.body;

    if (!prompt) throw new HttpError(400, "prompt is required");
    if (!req.file) throw new HttpError(400, "image file is required");

    const imageUrl = await uploadToFalStorage(req.file.buffer, req.file.originalname, req.file.mimetype);

    const input = {
      prompt,
      image_url: imageUrl,
      negative_prompt: negative_prompt || "jitter, bad hands, blur, distortion",
      audio_negative_prompt: audio_negative_prompt || "robotic, muffled, echo, distorted",
      num_inference_steps: num_inference_steps ? Number(num_inference_steps) : 30,
      seed: seed ? Number(seed) : undefined,
      resolution: resolution || "992x512",
    };

    const webhookUrl = `${process.env.PUBLIC_BASE_URL}/webhooks/fal/i2v`;
    const requestId = await submitI2V(input, webhookUrl);

    res.status(202).json({ requestId, status: "SUBMITTED", imageUrl });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/i2v/status/:id
 */
router.get("/status/:id", async (req, res, next) => {
  try {
    const status = await getStatus(req.params.id, { logs: true });
    res.json(status);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/i2v/result/:id
 */
router.get("/result/:id", async (req, res, next) => {
  try {
    const result = await getResult(req.params.id);
    res.json(result); // { data: { video: { url }, seed }, requestId }
  } catch (err) {
    next(err);
  }
});

export default router;
