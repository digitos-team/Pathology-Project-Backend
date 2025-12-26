import * as patientService from "../services/patient.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";




// Register Patient
export const createPatient = asyncHandler(async (req, res) => {
  console.log("[CONTROLLER] createPatient", req.body);
  const patient = await patientService.createPatient(
    req.body,
    req.user.userId
  );

  res.status(201).json(
    new ApiResponse(201, patient, "Patient registered successfully")
  );
});

// Get All Patients Added Pagination 
export const getPatients = asyncHandler(async (req, res) => {
  // Extract pagination and filter parameters from query string
  const options = {
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
    gender: req.query.gender,
    sortBy: req.query.sortBy,
    sortOrder: req.query.sortOrder,
    ageMin: req.query.ageMin,
    ageMax: req.query.ageMax,
  };

  const result = await patientService.getPatientsByLab(req.user.userId, options);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        patients: result.patients,
        pagination: result.pagination,
      },
      "Patients fetched successfully"
    )
  );
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

//get daily patient
export const getDailyPatient = asyncHandler(async (req, res) => {
  const { year, month } = req.query;

  if (!year || !month) {
    return res.status(400).json(
      new ApiResponse(400, null, "Year and month are required")
    );
  }

  const labId = req.user.labId; 

  const data = await patientService.dailypatient(
    labId,
    Number(year),
    Number(month)
  );

  res.status(200).json(
    new ApiResponse(200, data, "Daily patient fetched successfully")
  );
});