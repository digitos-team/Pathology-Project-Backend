import * as patientService from "../services/patient.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Register Patient
export const createPatient = asyncHandler(async (req, res) => {
  console.log("[CONTROLLER] createPatient", req.body);
  const labId = req.user.labId;
  if (!labId) {
    throw new ApiError(
      400,
      "Lab ID is missing from your session. Please re-login."
    );
  }
  const patient = await patientService.createPatient(
    req.body,
    req.user.userId,
    labId
  );
  res
    .status(201)
    .json(new ApiResponse(201, patient, "Patient registered successfully"));
});

// Get All Patients
export const getPatients = asyncHandler(async (req, res) => {
  const labId = req.user.labId;
  if (!labId) {
    throw new ApiError(
      400,
      "Lab ID is missing from your session. Please re-login."
    );
  }
  const patients = await patientService.getPatientsByLab(labId);
  res
    .status(200)
    .json(new ApiResponse(200, patients, "Patients fetched successfully"));
});

// Get Patient Profile
export const getPatientById = asyncHandler(async (req, res) => {
  const labId = req.user.labId;
  if (!labId) {
    throw new ApiError(
      400,
      "Lab ID is missing from your session. Please re-login."
    );
  }
  const patient = await patientService.getPatientById(req.params.id, labId);
  if (!patient) throw new ApiError(404, "Patient not found");
  res
    .status(200)
    .json(
      new ApiResponse(200, patient, "Patient details fetched successfully")
    );
});

// Update Patient
export const updatePatient = asyncHandler(async (req, res) => {
  const labId = req.user.labId;
  if (!labId) {
    throw new ApiError(
      400,
      "Lab ID is missing from your session. Please re-login."
    );
  }
  const patient = await patientService.updatePatient(
    req.params.id,
    labId,
    req.body
  );
  if (!patient) throw new ApiError(404, "Patient not found");
  res
    .status(200)
    .json(new ApiResponse(200, patient, "Patient updated successfully"));
});

// Search Patient
export const searchPatient = asyncHandler(async (req, res) => {
  const labId = req.user.labId;
  if (!labId) {
    throw new ApiError(
      400,
      "Lab ID is missing from your session. Please re-login."
    );
  }
  const patients = await patientService.searchPatient(labId, req.query);
  res.status(200).json(new ApiResponse(200, patients, "Patients found"));
});
