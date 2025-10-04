import "dotenv/config.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { initFal } from "./lib/fal.js";
import { errorMiddleware } from "./utils/errors.js";
import { logger } from "./utils/logger.js";
import i2vRouter from "./routes/i2v.js";
import webhookRouter from "./routes/webhooks.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/i2v", i2vRouter);
app.use("/webhooks/fal", webhookRouter);

app.use(errorMiddleware);

const port = process.env.PORT || 3000;
initFal();
app.listen(port, () => logger.info(`Server listening on :${port}`));
