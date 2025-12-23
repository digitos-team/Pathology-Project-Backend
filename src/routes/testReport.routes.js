import express from "express";
import {
  assignTestController,
  submitTestResultController,
  getPendingTestsController,
  getPatientReportsController,
  addHistoricalReportController
} from "../controllers/testReport.controller.js";
import { authMiddleware, adminMiddleware } from "../middleware/user.middleware.js";

const router = express.Router();

// Protected Routes
router.use(authMiddleware);

// Assign Test (Receptionist/Admin)
router.post("/assign", assignTestController);

// Add Historical/External Report (Receptionist/Admin)
router.post("/add-report", addHistoricalReportController);

// Submit Results (Technician/Admin)
router.put("/result/:reportId", submitTestResultController);

// Get Pending Tests (Technician Dashboard)
router.get("/pending", getPendingTestsController);

// Get Patient History
router.get("/patient/:patientId", getPatientReportsController);

export default router;
