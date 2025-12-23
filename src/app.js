import express from "express";
import userRoutes from "./routes/user.routes.js";
// import adminRoutes from "./routes/admin.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import labtestRoutes from "./routes/labtest.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import { errorHandler } from "./middleware/errorHandler.middleware.js";
import cookieParser from "cookie-parser";
export const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); // Serve files from public directory
app.use(cookieParser());
// Routes
app.use("/api/user", userRoutes);
// app.use("/api/admin", adminRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/labtest", labtestRoutes);
app.use("/api/expense", expenseRoutes);
// Health check
app.get("/", (req, res) => {
  res.json({ message: "Pathology Lab API is running" });
});

// Error handling middleware (must be last)
app.use(errorHandler);