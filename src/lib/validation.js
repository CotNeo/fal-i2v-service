import { z } from "zod";

const ResolutionEnum = z.enum([
  "512x992", "992x512", "960x512", "512x960", "720x720", "448x1120", "1120x448",
]);

// Fal dokümanındaki alanlar
export const I2VInputSchema = z.object({
  prompt: z.string().min(1, "prompt is required"),
  negative_prompt: z.string().optional().default("jitter, bad hands, blur, distortion"),
  num_inference_steps: z.number().int().min(1).max(100).optional().default(30),
  audio_negative_prompt: z.string().optional().default("robotic, muffled, echo, distorted"),
  seed: z.number().int().optional(),
  image_url: z.string().url("image_url must be a valid URL").optional(),
  // Opsiyonel: çözünürlük
  resolution: ResolutionEnum.optional().default("992x512"),
});

// Upload senaryosunda image_url yerine dosya kabul edeceğiz
export const I2VUploadSchema = I2VInputSchema.extend({
  image_url: z.string().url().optional(), // ya url ya dosya gelir
}).refine((data) => true, {}); // Ek kurallar istersen burada
