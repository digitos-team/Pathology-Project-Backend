import TestReport from "../models/testReport.model.js";
import Patient from "../models/patient.model.js";
import LabTest from "../models/labtest.model.js";
// Dynamic import for Doctor to avoid circular dependency issues if any
const getDoctorModel = async () => (await import("../models/doctor.model.js")).default;
import { ApiError } from "../utils/ApiError.js";

// 1. Assign Tests
export const assignTestsToPatient = async ({ patientId, testIds, doctorId, labId }) => {
  // Validate Patient
  const patient = await Patient.findById(patientId);
  if (!patient) throw new ApiError(404, "Patient not found");

  // Validate Doctor
  const Doctor = await getDoctorModel();
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new ApiError(404, "Doctor not found");

  const reports = [];
  let totalAmount = 0;
  const testsInfo = [];

  for (const testId of testIds) {
    const labTest = await LabTest.findById(testId);
    if (!labTest) {
      throw new ApiError(404, `Test with ID ${testId} not found`);
    }

    const initialResults = labTest.parameters.map(param => ({
      parameterName: param.name,
      value: "",
      unit: param.unit,
      referenceRange: param.referenceRange
    }));

    const testReport = await TestReport.create({
      patientId,
      testId,
      labId,
      testName: labTest.testName,
      testDate: new Date(),
      status: "PENDING",
      results: initialResults,
      doctor: doctorId
    });

    reports.push(testReport);
    totalAmount += labTest.price;
    testsInfo.push({ name: labTest.testName, price: labTest.price });
  }

  // Generate invoice
  const invoiceService = await import("./invoice.service.js");
  const invoice = await invoiceService.generateInvoice({
    patientId,
    doctorId,
    testReports: reports.map(r => r._id),
    items: testsInfo,
    totalAmount,
    labId,
  });

  return { reports, totalAmount, breakdown: testsInfo, invoice };
};

// 2. Add Historical Report
export const addHistoricalReport = async ({ patientId, testName, doctorName, testDate, reportFileUrl, labId, testId }) => {
  const report = await TestReport.create({
    patientId,
    testId, // Optional
    labId,
    testName,
    testDate: testDate || new Date(),
    status: "COMPLETED",
    results: [],
    reportFileUrl,
    doctorName: doctorName || "External",
  });
  return report;
};

// 3. Submit Results
export const submitTestResults = async (reportId, { results, reportFileUrl }) => {
  const report = await TestReport.findById(reportId);
  if (!report) throw new ApiError(404, "Test Report not found");
  if (report.status === "COMPLETED") throw new ApiError(400, "Test is already completed");

  if (results && Array.isArray(results)) {
    results.forEach(inputResult => {
      const paramIndex = report.results.findIndex(r => r.parameterName === inputResult.parameterName);
      if (paramIndex !== -1) {
        report.results[paramIndex].value = inputResult.value;
      }
    });
  }

  if (reportFileUrl) report.reportFileUrl = reportFileUrl;

  report.status = "COMPLETED";
  await report.save();
  return report;
};

// 4. Get Pending Tests
export const getPendingTests = async (labId) => {
  return await TestReport.find({ labId, status: "PENDING" })
    .populate("patientId", "fullName phone age gender")
    .populate("doctor", "name")
    .sort({ testDate: 1 });
};

// 5. Get Patient Reports
export const getPatientReports = async (patientId, labId) => {
  return await TestReport.find({ patientId, labId })
    .populate("doctor", "name")
    .sort({ testDate: -1 });
};
