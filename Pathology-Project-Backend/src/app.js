import express from "express";
import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from "./middleware/errorHandler.middleware.js";

export const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Pathology Lab API is running" });
});

// Error handling middleware (must be last)
app.use(errorHandler);