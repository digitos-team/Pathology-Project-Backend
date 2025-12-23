import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as testReportService from "../services/testReport.service.js";

// 1. Assign Test to Patient (Create Pending Report)
export const assignTestController = asyncHandler(async (req, res) => {
  const { patientId, testIds, doctorId } = req.body;
  const labId = req.user.labId;

  if (!patientId || !testIds || !doctorId) {
    throw new ApiError(400, "Patient ID, Test IDs (array), and Doctor ID are required");
  }

  if (!Array.isArray(testIds) || testIds.length === 0) {
    throw new ApiError(400, "testIds must be a non-empty array");
  }

  const result = await testReportService.assignTestsToPatient({
    patientId,
    testIds,
    doctorId,
    labId
  });

  res.status(201).json(new ApiResponse(201, result, "Tests assigned successfully"));
});

// 1.1 Upload Historical Report
export const addHistoricalReportController = asyncHandler(async (req, res) => {
  const { patientId, testName, doctorName, testDate, reportFileUrl, testId } = req.body;
  const labId = req.user.labId;

  if (!patientId || !testName || !reportFileUrl) {
    throw new ApiError(400, "Patient ID, Test Name, and Report File URL are required");
  }

  const report = await testReportService.addHistoricalReport({
    patientId,
    testName,
    doctorName,
    testDate,
    reportFileUrl,
    labId,
    testId
  });

  res.status(201).json(new ApiResponse(201, report, "Historical report added successfully"));
});

// 2. Submit Test Results
export const submitTestResultController = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const { results, reportFileUrl } = req.body;

  const report = await testReportService.submitTestResults(reportId, { results, reportFileUrl });

  res.status(200).json(new ApiResponse(200, report, "Test results submitted successfully"));
});

// 3. Get Pending Tests
export const getPendingTestsController = asyncHandler(async (req, res) => {
  const labId = req.user.labId;
  const pendingTests = await testReportService.getPendingTests(labId);
  res.status(200).json(new ApiResponse(200, pendingTests, "Pending tests fetched successfully"));
});

// 4. Get Patient Reports
export const getPatientReportsController = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const labId = req.user.labId;

  const reports = await testReportService.getPatientReports(patientId, labId);
  res.status(200).json(new ApiResponse(200, reports, "Patient reports fetched successfully"));
});
