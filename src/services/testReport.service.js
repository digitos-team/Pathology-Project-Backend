// import TestReport from "../models/testReport.model.js"; // consolidated into TestOrder
// ✅ ADDED
import Patient from "../models/patient.model.js";
import LabTest from "../models/labtest.model.js";
import Bill from "../models/bill.model.js";
const getDoctorModel = async () => (await import("../models/doctor.model.js")).default;
import { ApiError } from "../utils/ApiError.js";
import TestOrder from "../models/testorder.model.js";

// 1. Create Test Order
export const createTestOrder = async ({ patientId, testIds, doctorId, labId }) => {
  const patient = await Patient.findById(patientId);
  if (!patient) throw new ApiError(404, "Patient not found");

  const Doctor = await getDoctorModel();
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new ApiError(404, "Doctor not found");

  const tests = [];
  let totalAmount = 0;

  for (const testId of testIds) {
    const labTest = await LabTest.findById(testId);
    if (!labTest) {
      throw new ApiError(404, `Test with ID ${testId} not found`);
    }

    const initialResults = labTest.parameters.map(param => {
      // Find range matching patient gender
      const matchingRange = param.referenceRanges.find(r => r.gender === patient.gender) || param.referenceRanges[0];

      return {
        parameterName: param.name,
        value: "",
        unit: param.unit,
        referenceRange: {
          min: matchingRange.min,
          max: matchingRange.max
        }
      };
    });

    tests.push({
      testId: labTest._id,
      testName: labTest.testName,
      price: labTest.price,
      status: "PENDING",
      results: initialResults
    });

    totalAmount += labTest.price;
  }

  const testOrder = await TestOrder.create({
    patientId,
    labId,
    doctor: doctorId,
    tests,
    totalAmount,
    overallStatus: "PENDING"
  });

  const billService = await import("./bill.service.js");
  const bill = await billService.generateBill({
    patientId,
    testOrderId: testOrder._id,
    items: tests.map(t => ({ name: t.testName, price: t.price })),
    totalAmount,
    labId,
  });

  testOrder.billId = bill._id;
  await testOrder.save();

  return { testOrder, bill };
};

// 2. Add Historical Report (Consolidated into TestOrder)
export const addHistoricalReport = async ({ patientId, testName, doctorName, testDate, reportFileUrl, labId, testId }) => {
  const testOrder = await TestOrder.create({
    patientId,
    labId,
    doctorName: doctorName || "External",
    orderDate: testDate || new Date(),
    overallStatus: "COMPLETED",
    isHistorical: true,
    totalAmount: 0,
    tests: [{
      testId,
      testName,
      status: "COMPLETED",
      reportFileUrl,
      results: []
    }]
  });
  return testOrder;
};

// 3. Submit Results for Individual Test
export const submitTestResults = async (orderId, testItemId, { results, reportFileUrl }) => {
  const order = await TestOrder.findById(orderId);
  if (!order) throw new ApiError(404, "Test Order not found");

  let testItem = order.tests.id(testItemId);

  // If not found by subdocument ID, try finding by the LabTest ID (reference)
  if (!testItem) {
    testItem = order.tests.find(t => t.testId.toString() === testItemId);
  }

  if (!testItem) throw new ApiError(404, "Test not found in this order");



  if (results && Array.isArray(results)) {
    results.forEach(inputResult => {
      const paramIndex = testItem.results.findIndex(
        r => r.parameterName.trim().toLowerCase() === inputResult.parameterName.trim().toLowerCase()
      );
      if (paramIndex !== -1) {
        testItem.results[paramIndex].value = inputResult.value;
      }
    });
  }

  if (reportFileUrl) testItem.reportFileUrl = reportFileUrl;
  testItem.status = "COMPLETED";

  const allCompleted = order.tests.every(t => t.status === "COMPLETED");
  const anyCompleted = order.tests.some(t => t.status === "COMPLETED");

  order.overallStatus = allCompleted ? "COMPLETED" : (anyCompleted ? "PARTIAL" : "PENDING");

  await order.save();
  return order;
};

// 4. Get Pending Test Orders ✅ FIXED
export const getPendingOrders = async (labId) => {
  return await TestOrder.find({
    labId,
    overallStatus: { $in: ["PENDING", "PARTIAL"] },
    isHistorical: { $ne: true } // Only show actual orders on pending dash
  })
    .populate("patientId", "fullName phone age gender")
    .populate("doctor", "name")
    .sort({ orderDate: 1 });
};

export const getPatientTestHistory = async (patientId, labId) => {
  const orders = await TestOrder.find({ patientId, labId })
    .populate("patientId", "fullName phone age gender")
    .populate("doctor", "name")
    .sort({ orderDate: -1 });

  const activeOrders = orders.filter(o => o.overallStatus !== "COMPLETED");
  const completedReports = orders.filter(o => o.overallStatus === "COMPLETED");

  return { orders: activeOrders, reports: completedReports };
};
// 5. Get Patient Orders (active/recent) ✅ NEW
export const getPatientOrders = async (patientId, labId) => {
  return await TestOrder.find({ patientId, labId })
    .populate("patientId", "fullName phone age gender")
    .populate("doctor", "name")
    .sort({ orderDate: -1 });
};

// 5b. Get Patient Reports (historical/finalized) ✅ UPDATED
export const getPatientReports = async (patientId, labId) => {
  return await TestOrder.find({
    patientId,
    labId,
    overallStatus: "COMPLETED"
  })
    .populate("patientId", "fullName phone age gender")
    .populate("doctor", "name")
    .sort({ orderDate: -1 });
};

// 6. Bulk Submit Results by Bill ✅ UPDATED
export const submitBulkResultsByBill = async (billId, { results, reportFileUrl }) => {
  const bill = await Bill.findById(billId);
  if (!bill) throw new ApiError(404, "Bill not found");

  const order = await TestOrder.findById(bill.testOrderId);
  if (!order) throw new ApiError(404, "Test Order not found for this bill");

  let anyUpdated = false;

  order.tests.forEach(testItem => {
    if (testItem.status === "COMPLETED") return;

    results?.forEach(inputResult => {
      const paramIndex = testItem.results.findIndex(
        r => r.parameterName === inputResult.parameterName
      );
      if (paramIndex !== -1) {
        testItem.results[paramIndex].value = inputResult.value;
        anyUpdated = true;
      }
    });

    if (reportFileUrl) {
      testItem.reportFileUrl = reportFileUrl;
      anyUpdated = true;
    }

    const allFilled = testItem.results.every(r => r.value && r.value.trim() !== "");
    if (allFilled) {
      testItem.status = "COMPLETED";
    }
  });

  if (anyUpdated) {
    const allCompleted = order.tests.every(t => t.status === "COMPLETED");
    const anyCompleted = order.tests.some(t => t.status === "COMPLETED");
    order.overallStatus = allCompleted ? "COMPLETED" : (anyCompleted ? "PARTIAL" : "PENDING");
    await order.save();
  }

  return order;
};

// 7. Finalize Test Order (unchanged - good!)
export const finalizeTestOrder = async (orderId) => {
  const order = await TestOrder.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Test Order not found");
  }

  if (order.overallStatus !== "COMPLETED") {
    throw new ApiError(400, "Cannot finalize - not all tests completed");
  }

  return order;
};