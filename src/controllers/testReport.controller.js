import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as testOrderService from "../services/testReport.service.js";
import { sendReportEmail } from "../services/email.service.js";
import Patient from "../models/patient.model.js";
import PDFDocument from "pdfkit";
import { generateTestReportPDF } from "../utils/pdfGenerator.js";
import PathologyLab from "../models/pathologyLab.model.js";
import fs from "fs";
import path from "path";



/**
 * 1. Create Test Order (assign multiple tests)
 */
export const createTestOrderController = asyncHandler(async (req, res) => {
  const { patientId, testIds, doctorId } = req.body || {};
  const labId = req.user.labId;
  if (!labId) {
    throw new ApiError(
      400,
      "Lab ID is missing from your session. Please re-login."
    );
  }

  if (
    !patientId ||
    !doctorId ||
    !Array.isArray(testIds) ||
    testIds.length === 0
  ) {
    throw new ApiError(
      400,
      "patientId, doctorId and non-empty testIds are required"
    );
  }

  const data = await testOrderService.createTestOrder({
    patientId,
    testIds,
    doctorId,
    labId,
  });

  res
    .status(201)
    .json(new ApiResponse(201, data, "Test order created successfully"));
});

/**
 * 2. Add historical report
 */
export const addHistoricalReportController = asyncHandler(async (req, res) => {
  const { patientId, testName, reportFileUrl, doctorName, testDate, testId } =
    req.body;
  const labId = req.user.labId;
  if (!labId) {
    throw new ApiError(
      400,
      "Lab ID is missing from your session. Please re-login."
    );
  }

  if (!patientId || !testName || !reportFileUrl) {
    throw new ApiError(
      400,
      "patientId, testName and reportFileUrl are required"
    );
  }

  const report = await testOrderService.addHistoricalReport({
    patientId,
    testName,
    doctorName,
    testDate,
    reportFileUrl,
    labId,
    testId,
  });

  res.status(201).json(new ApiResponse(201, report, "Historical report added"));
});

/**
 * 3. Submit result for ONE test inside an order
 */
export const submitTestResultController = asyncHandler(async (req, res) => {
  const { orderId, testItemId } = req.params;
  const { results, reportFileUrl } = req.body || {};

  if (!orderId || !testItemId) {
    throw new ApiError(400, "orderId and testItemId are required");
  }

  const order = await testOrderService.submitTestResults(orderId, testItemId, {
    results,
    reportFileUrl,
  });

  res.status(200).json(new ApiResponse(200, order, "Test result submitted"));
});

/**
 * 4. Get pending orders
 */
export const getPendingOrdersController = asyncHandler(async (req, res) => {
  const labId = req.user.labId;
  if (!labId) {
    throw new ApiError(
      400,
      "Lab ID is missing from your session. Please re-login."
    );
  }

  const orders = await testOrderService.getPendingOrders(labId);

  res.status(200).json(new ApiResponse(200, orders, "Pending orders fetched"));
});

/**
 * 5. Get patient history (orders + reports)
 */
export const getPatientTestHistoryController = asyncHandler(
  async (req, res) => {
    const { patientId } = req.params;
    const labId = req.user.labId;
    if (!labId) {
      throw new ApiError(
        400,
        "Lab ID is missing from your session. Please re-login."
      );
    }

    if (!patientId) {
      throw new ApiError(400, "patientId is required");
    }

    const data = await testOrderService.getPatientTestHistory(patientId, labId);

    res
      .status(200)
      .json(new ApiResponse(200, data, "Patient test history fetched"));
  }
);

/**
 * 5b. Get patient orders
 */
export const getPatientOrdersController = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const labId = req.user.labId;
  if (!labId) {
    throw new ApiError(
      400,
      "Lab ID is missing from your session. Please re-login."
    );
  }

  const orders = await testOrderService.getPatientOrders(patientId, labId);
  res.json(new ApiResponse(200, orders, "Patient orders fetched"));
});

/**
 * 5c. Get patient completed reports
 */
export const getPatientReportsController = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const labId = req.user.labId;
  if (!labId) {
    throw new ApiError(
      400,
      "Lab ID is missing from your session. Please re-login."
    );
  }

  const reports = await testOrderService.getPatientReports(patientId, labId);
  res.json(new ApiResponse(200, reports, "Patient reports fetched"));
});

/**
 * 6. Bulk submit results via bill
 */
export const submitBulkResultsController = asyncHandler(async (req, res) => {
  const { billId } = req.params;
  const { results, reportFileUrl } = req.body || {};

  if (!billId) {
    throw new ApiError(400, "billId is required");
  }

  const order = await testOrderService.submitBulkResultsByBill(billId, {
    results,
    reportFileUrl,
  });

  res.status(200).json(new ApiResponse(200, order, "Bulk results submitted"));
});

/**
 * 7. Finalize order → generate reports
 */
export const finalizeTestOrderController = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const reports = await testOrderService.finalizeTestOrder(orderId);

  res
    .status(200)
    .json(
      new ApiResponse(200, reports, "Order finalized and reports generated")
    );
});

/**
 * 8. Download Test Report PDF
 */
export const downloadTestReportPDFController = asyncHandler(
  async (req, res) => {
    const { orderId } = req.params;

    const order = await testOrderService.getTestOrderById(orderId);
    if (!order) {
      throw new ApiError(404, "Test Order not found");
    }

    const lab = await PathologyLab.findById(order.labId);
    if (!lab) {
      throw new ApiError(404, "Lab details not found");
    }

    const doc = new PDFDocument({ margin: 30, size: "A4" });

    const filename = `Report-${order.patientId.fullName.replace(
      /[^a-zA-Z0-9]/g,
      "_"
    )}-${Date.now()}.pdf`;

    // Local directory
    const reportsDir = path.join(process.cwd(), "uploads", "reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const filePath = path.join(reportsDir, filename);

    // Store RELATIVE path in DB
    const reportPdfPath = `/uploads/reports/${filename}`;

    const fileStream = fs.createWriteStream(filePath);

    // Pipe to local file
    doc.pipe(fileStream);

    // Pipe to response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    doc.pipe(res);

    generateTestReportPDF(doc, order, lab);
    doc.end();

    // Update patient AFTER file saved
    fileStream.on("finish", async () => {
      await Patient.findByIdAndUpdate(order.patientId._id, {
        reportPdfPath: reportPdfPath,
        reportStatus: "generated",
      });

      console.log("Report generated & saved:", reportPdfPath);
    });

    // Error handling (important)
    fileStream.on("error", async () => {
      await Patient.findByIdAndUpdate(order.patientId._id, {
        reportStatus: "failed",
      });
    });
  }
);
// Sends Report to patient Via Email
export const generateAndSendReportViaEmail = asyncHandler(async (req, res) => {
  let patient; // declare outside

  try {
    const { patientId } = req.params;

    // 🔹 STEP 1 — FETCH PATIENT
    patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    if (!patient.email) {
      return res.status(400).json({ message: "Patient email missing" });
    }

    if (!patient.reportPdfPath) {
      return res.status(400).json({ message: "Report PDF not generated yet" });
    }

    // 🔹 STEP 2 — SEND EMAIL
    const sendsEmail = await sendReportEmail({
      to: patient.email,
      pdfPath: path.join(process.cwd(), patient.reportPdfPath),
      patientName: patient.fullName,
    });

    // 🔹 STEP 3 — UPDATE STATUS
    patient.reportStatus = "sent";
    patient.emailSentAt = new Date();
    await patient.save();

    return res
      .status(200)
      .json(new ApiResponse(200, sendsEmail, "Report sent successfully"));
  } catch (error) {
    console.error(error);

    // update only if patient exists
    if (patient) {
      patient.reportStatus = "failed";
      patient.emailSentAt = new Date();
      await patient.save();
    }

    throw new ApiError(500, "Failed to send report");
  }
});