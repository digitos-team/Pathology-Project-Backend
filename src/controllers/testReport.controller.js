import * as testReportService from "../services/testReport.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const createTestReport = asyncHandler(async (req, res) => {
  const { labId } = req.user;
  if (!labId) throw new ApiError(400, "Lab ID missing");

  const report = await testReportService.createTestReport(req.body, labId);

  res
    .status(201)
    .json(new ApiResponse(201, report, "Test report created successfully"));
});

export const getTestReportsByPatient = asyncHandler(async (req, res) => {
  const { labId } = req.user;
  const { patientId } = req.params;

  if (!labId) throw new ApiError(400, "Lab ID missing");

  const reports = await testReportService.getTestReportsByPatient(
    patientId,
    labId
  );
  console.log("[CONTROLLER] getTestReportsByPatient", reports);


  res.json(new ApiResponse(200, reports, "Test reports fetched successfully"));
});

export const getTestReportById = asyncHandler(async (req, res) => {
  const { labId } = req.user;
  const { id } = req.params;

  if (!labId) throw new ApiError(400, "Lab ID missing");

  const report = await testReportService.getTestReportById(id, labId);
  console.log("[CONTROLLER] getTestReportById", report);


  res.json(new ApiResponse(200, report, "Test report details"));
});

export const updateTestReport = asyncHandler(async (req, res) => {
  const { labId } = req.user;
  const { id } = req.params;

  if (!labId) throw new ApiError(400, "Lab ID missing");

  const report = await testReportService.updateTestReport(id, labId, req.body);
  console.log("[CONTROLLER] updateTestReport", report);

  res.json(new ApiResponse(200, report, "Test report updated successfully"));
});

export const deleteTestReport = asyncHandler(async (req, res) => {
  const { labId } = req.user;
  const { id } = req.params;

  if (!labId) throw new ApiError(400, "Lab ID missing");

  await testReportService.deleteTestReport(id, labId);
  console.log("[CONTROLLER] deleteTestReport");

  res.json(new ApiResponse(200, {}, "Test report deleted successfully"));
});
