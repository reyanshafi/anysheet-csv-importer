import "dotenv/config";

function intEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export const config = {
  port: intEnv("PORT", 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? "*",

  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",

  /** Rows sent to the model per request. */
  batchSize: intEnv("BATCH_SIZE", 20),
  /** AI batches processed in parallel. */
  batchConcurrency: intEnv("BATCH_CONCURRENCY", 3),
  /** Attempts per batch before its rows are reported as skipped. */
  aiMaxRetries: intEnv("AI_MAX_RETRIES", 3),

  maxRows: intEnv("MAX_ROWS", 2000),
  maxFileSizeMb: intEnv("MAX_FILE_SIZE_MB", 10),
} as const;

export type AppConfig = typeof config;
