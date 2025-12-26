import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as testOrderService from "../services/testReport.service.js";

/**
 * 1. Create Test Order (assign multiple tests)
 */
export const createTestOrderController = asyncHandler(async (req, res) => {
  const { patientId, testIds, doctorId } = req.body;
  const labId = req.user.labId;

  if (!patientId || !doctorId || !Array.isArray(testIds) || testIds.length === 0) {
    throw new ApiError(400, "patientId, doctorId and non-empty testIds are required");
  }

  const data = await testOrderService.createTestOrder({
    patientId,
    testIds,
    doctorId,
    labId
  });

  res.status(201).json(
    new ApiResponse(201, data, "Test order created successfully")
  );
});

/**
 * 2. Add historical report
 */
export const addHistoricalReportController = asyncHandler(async (req, res) => {
  const { patientId, testName, reportFileUrl, doctorName, testDate, testId } = req.body;
  const labId = req.user.labId;

  if (!patientId || !testName || !reportFileUrl) {
    throw new ApiError(400, "patientId, testName and reportFileUrl are required");
  }

  const report = await testOrderService.addHistoricalReport({
    patientId,
    testName,
    doctorName,
    testDate,
    reportFileUrl,
    labId,
    testId
  });

  res.status(201).json(
    new ApiResponse(201, report, "Historical report added")
  );
});

/**
 * 3. Submit result for ONE test inside an order
 */
export const submitTestResultController = asyncHandler(async (req, res) => {
  const { orderId, testItemId } = req.params;
  const { results, reportFileUrl } = req.body;

  if (!orderId || !testItemId) {
    throw new ApiError(400, "orderId and testItemId are required");
  }

  const order = await testOrderService.submitTestResults(
    orderId,
    testItemId,
    { results, reportFileUrl }
  );

  res.status(200).json(
    new ApiResponse(200, order, "Test result submitted")
  );
});

/**
 * 4. Get pending orders
 */
export const getPendingOrdersController = asyncHandler(async (req, res) => {
  const labId = req.user.labId;

  const orders = await testOrderService.getPendingOrders(labId);

  res.status(200).json(
    new ApiResponse(200, orders, "Pending orders fetched")
  );
});

/**
 * 5. Get patient history (orders + reports)
 */
export const getPatientTestHistoryController = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const labId = req.user.labId;

  if (!patientId) {
    throw new ApiError(400, "patientId is required");
  }

  const data = await testOrderService.getPatientTestHistory(patientId, labId);

  res.status(200).json(
    new ApiResponse(200, data, "Patient test history fetched")
  );
});

/**
 * 6. Bulk submit results via bill
 */
export const submitBulkResultsController = asyncHandler(async (req, res) => {
  const { billId } = req.params;
  const { results, reportFileUrl } = req.body;

  if (!billId) {
    throw new ApiError(400, "billId is required");
  }

  const order = await testOrderService.submitBulkResultsByBill(
    billId,
    { results, reportFileUrl }
  );

  res.status(200).json(
    new ApiResponse(200, order, "Bulk results submitted")
  );
});

/**
 * 7. Finalize order → generate reports
 */
export const finalizeTestOrderController = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const reports = await testOrderService.finalizeTestOrder(orderId);

  res.status(200).json(
    new ApiResponse(200, reports, "Order finalized and reports generated")
  );
});
