import express from "express";
import userRoutes from "./routes/user.routes.js";
import cookieParser from "cookie-parser";
// import adminRoutes from "./routes/admin.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import labtestRoutes from "./routes/labtest.routes.js";
import { errorHandler } from "./middleware/errorHandler.middleware.js";
import patientRoutes from "./routes/patient.routes.js";
export const app = express();

app.use(cookieParser());
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import testReportRoutes from "./routes/testReport.routes.js";

// Routes
app.use("/api/user", userRoutes);

// app.use("/api/admin", adminRoutes);
app.use("/api/doctor", doctorRoutes);

// Health check
app.use("/api/labtest", labtestRoutes);

// Patient routes
app.use("/api/patient", patientRoutes);

// Test Report routes
app.use("/api/test-report", testReportRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Pathology Lab API is running" });
});

// Error handling middleware (must be last)
app.use(errorHandler);