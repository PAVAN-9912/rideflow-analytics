import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import apiRoutes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  const rawOrigins = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
  const allowedOrigins = rawOrigins.split(",").map((o) => o.trim());

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        try {
          const originUrl = new URL(origin);
          const isVercel = originUrl.hostname.endsWith(".vercel.app");
          const isLocal = originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1";
          const isExplicit =
            allowedOrigins.includes("*") || allowedOrigins.includes(origin);

          if (isVercel || isLocal || isExplicit) {
            return callback(null, true);
          }
        } catch {
          if (allowedOrigins.includes(origin)) {
            return callback(null, true);
          }
        }
        return callback(null, false);
      },
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api", apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
