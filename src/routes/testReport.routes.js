import express from "express";
import {
  createTestReport,
  getTestReportsByPatient,
  getTestReportById,
  updateTestReport,
  deleteTestReport,
} from "../controllers/testReport.controller.js";
import { authMiddleware } from "../middleware/user.middleware.js";

const router = express.Router();

router.use(authMiddleware);

// Create a new report
router.post("/", createTestReport);

// Get all reports for a specific patient
router.get("/patient/:patientId", getTestReportsByPatient);

// Get single report by ID
router.get("/:id", getTestReportById);

// Update report
router.put("/:id", updateTestReport);

// Delete report
router.delete("/:id", deleteTestReport);

export default router;
