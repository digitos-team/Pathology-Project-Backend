import * as patientService from "../services/patient.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Register Patient
export const createPatient = asyncHandler(async (req, res) => {
  console.log("[CONTROLLER] createPatient", req.body);
  const patient = await patientService.createPatient(req.body, req.user.userId);
  res.status(201).json(new ApiResponse(201, patient, "Patient registered successfully"));
});

// Get All Patients
export const getPatients = asyncHandler(async (req, res) => {
  const patients = await patientService.getPatientsByLab(req.user.userId);
  res.status(200).json(new ApiResponse(200, patients, "Patients fetched successfully"));
});

// Get Patient Profile
export const getPatientById = asyncHandler(async (req, res) => {
  const patient = await patientService.getPatientById(req.params.id, req.user.userId);
  if (!patient) throw new ApiError(404, "Patient not found");
  res.status(200).json(new ApiResponse(200, patient, "Patient details fetched successfully"));
});

// Update Patient
export const updatePatient = asyncHandler(async (req, res) => {
  const patient = await patientService.updatePatient(req.params.id, req.user.userId, req.body);
  if (!patient) throw new ApiError(404, "Patient not found");
  res.status(200).json(new ApiResponse(200, patient, "Patient updated successfully"));
});

// Search Patient
export const searchPatient = asyncHandler(async (req, res) => {
  const patients = await patientService.searchPatient(req.user.userId, req.query);
  res.status(200).json(new ApiResponse(200, patients, "Patients found"));
});
