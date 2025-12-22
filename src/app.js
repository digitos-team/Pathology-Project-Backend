import express from "express";
import userRoutes from "./routes/user.routes.js";
// import adminRoutes from "./routes/admin.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import labtestRoutes from "./routes/labtest.routes.js";
import { errorHandler } from "./middleware/errorHandler.middleware.js";

export const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/user", userRoutes);
// app.use("/api/admin", adminRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/labtest", labtestRoutes);
// Health check
app.get("/", (req, res) => {
  res.json({ message: "Pathology Lab API is running" });
});

// Error handling middleware (must be last)
app.use(errorHandler);