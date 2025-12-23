import TestReport from "../models/testReport.model.js";
import Patient from "../models/patient.model.js";
import { ApiError } from "../utils/ApiError.js";

// Helper to verify patient belongs to lab
const verifyPatientOwnership = async (patientId, labId) => {
  const patient = await Patient.findOne({ _id: patientId, labId }); // Find patient by ID
  if (!patient) {
    throw new ApiError(404, "Patient not found in your lab"); // If patient not found
  }
  return patient;
};

export const createTestReport = async (data, labId) => {
  // 1. Verify Patient exists in this Lab
  await verifyPatientOwnership(data.patientId, labId);

  // 2. Create Report
  const report = await TestReport.create(data);
  console.log("[SERVICE] createTestReport", report);

  // 3. Link Report to Patient
  await Patient.findByIdAndUpdate(data.patientId, {
    $push: { testHistory: report._id },
  });

  return report;
};

export const getTestReportsByPatient = async (patientId, labId) => {
   // 1. Verify patient belongs to lab
  await verifyPatientOwnership(patientId, labId);
  console.log("[SERVICE] getTestReportsByPatient", patientId, labId);
  // 2. Get Reports
  const reports = await TestReport.find({ patientId }).sort({ createdAt: -1 }); // Get reports for patient
  console.log("[SERVICE] getTestReportsByPatient", reports);

  return reports;
};

export const getTestReportById = async (reportId, labId) => {
  const report = await TestReport.findById(reportId).populate("patientId"); // Find report by ID

  if (!report) {
    throw new ApiError(404, "Test report not found"); // If report not found
  }
  console.log("[SERVICE] getTestReportById", report);

  // Security Check: Ensure the patient associated with this report belongs to the requesting lab
  if (report.patientId.labId.toString() !== labId.toString()) {
    throw new ApiError(403, "Access denied");
  }


  return report;
};

export const updateTestReport = async (reportId, labId, updateData) => {
  const report = await getTestReportById(reportId, labId); // Get report by ID

  Object.assign(report, updateData); // Update report with new data

  await report.save();
  console.log("[SERVICE] updateTestReport", report);

  return report;
};

export const deleteTestReport = async (reportId, labId) => {
  const report = await getTestReportById(reportId, labId); // Get report by ID
  await report.deleteOne(); // Delete report
  console.log("[SERVICE] deleteTestReport", report);

  return { message: "Report deleted successfully" };
};
