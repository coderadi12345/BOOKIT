import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ZodError } from "zod";
import authRoutes from "./routes/auth.js";
import eventRoutes from "./routes/events.js";
import meRoutes from "./routes/me.js";
import bookingRoutes from "./routes/bookings.js";
import organizerRoutes from "./routes/organizer.js";
import { AppError } from "./lib/errors.js";

const app = express();

const frontendOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || frontendOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/me", meRoutes);
app.use("/bookings", bookingRoutes);
app.use("/organizer", organizerRoutes);

app.use((err, _req, res, _next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      details: err.errors,
    });
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
