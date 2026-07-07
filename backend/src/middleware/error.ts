import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { config } from "../config.js";

/** Operational error with an HTTP status; anything else is treated as a 500. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let status = 500;
  let message = "Internal server error";

  if (err instanceof ApiError) {
    status = err.status;
    message = err.message;
  } else if (err instanceof MulterError) {
    status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    message =
      err.code === "LIMIT_FILE_SIZE"
        ? `File too large. Maximum size is ${config.maxFileSizeMb} MB.`
        : err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  if (status >= 500) console.error("[error]", err);

  if (res.headersSent) {
    // Mid-stream failure on the NDJSON response: emit a terminal error event.
    res.write(JSON.stringify({ type: "error", message }) + "\n");
    res.end();
    return;
  }
  res.status(status).json({ error: message });
}
