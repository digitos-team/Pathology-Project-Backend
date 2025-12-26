import express from "express";
import {
  createTestOrderController as assignTestController,
  submitTestResultController,
  getPendingOrdersController as getPendingTestsController,
  getPatientTestHistoryController as getPatientReportsController,
  addHistoricalReportController,
  submitBulkResultsController,
  finalizeTestOrderController,
  downloadTestReportPDFController,
} from "../controllers/testReport.controller.js";
import {
  authMiddleware,
  adminMiddleware,
} from "../middleware/user.middleware.js";

const router = express.Router();

// Protected Routes
router.use(authMiddleware);

// Assign Test (Receptionist/Admin)
router.post("/createtestorder", assignTestController);

// Add Historical/External Report (Receptionist/Admin)
router.post("/add-report", addHistoricalReportController);

// Submit Results (Technician/Admin)
router.put("/result/:orderId/:testItemId", submitTestResultController);

// Bulk Submit Results via Bill (Technician/Admin)
router.put("/bill/:billId/submit", submitBulkResultsController);

// Get Pending Tests (Technician Dashboard)
router.get("/pending", getPendingTestsController);

// Finalize Test Order (Technician/Admin)
router.get("/finalize/:orderId", finalizeTestOrderController);

// Get Patient History
router.get("/patient/:patientId", getPatientReportsController);

// Download Test Report PDF
router.get("/:orderId/download", downloadTestReportPDFController);

export default router;
