import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

interface AppError extends Error {
  status?: number;
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: "Not found", path: req.originalUrl });
}

/** Centralized error handler - never leaks stack traces or DB internals to the client. */
export function errorHandler(err: AppError | ZodError, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Invalid request",
      details: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    });
  }

  const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 500;
  if (status >= 500) {
    console.error("[error]", err);
  }

  res.status(status).json({
    error: status >= 500 ? "Internal server error" : err.message,
  });
}
