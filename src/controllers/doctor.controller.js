import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
    createDoctorService,
    updateDoctorService,
    getAllDoctorsService,
    getDoctorCommissionReportService,
    deleteDoctorService
} from "../services/doctor.services.js";

// 1. Add Doctor
export const addDoctorController = asyncHandler(async (req, res) => {
    const doctorData = req.body;
    const adminId = req.user.userId;

    const doctor = await createDoctorService(doctorData, adminId);

    res.status(201).json(new ApiResponse(201, doctor, "Doctor added successfully"));
});

// 2. Update Doctor
export const updateDoctorController = asyncHandler(async (req, res) => {
    const { doctorId } = req.params;
    const updates = req.body;

    const doctor = await updateDoctorService(doctorId, updates);

    res.json(new ApiResponse(200, doctor, "Doctor updated successfully"));
});

// 3. List All Doctors
export const getAllDoctorsController = asyncHandler(async (req, res) => {
    const adminId = req.user.userId;

    const doctors = await getAllDoctorsService(adminId);

    // Check if empty? Service returns empty array.
    if (!doctors || doctors.length === 0) {
        return res.json(new ApiResponse(200, [], "No Lab found, hence no doctors"));
    }

    res.json(new ApiResponse(200, doctors, "Doctors fetched successfully"));
});


// 4. Commission Reports (Daily, Monthly, Yearly)
export const getDoctorCommissionReportController = asyncHandler(async (req, res) => {
    const { doctorId } = req.params;
    const { type } = req.query; // 'daily', 'monthly', 'yearly'

    const report = await getDoctorCommissionReportService(doctorId, type);

    res.json(new ApiResponse(200, report, `${type} commission report fetched successfully`));
});

// 5. Delete Doctor
export const deleteDoctorController = asyncHandler(async (req, res) => {
    const { doctorId } = req.params;

    await deleteDoctorService(doctorId);

    res.json(new ApiResponse(200, {}, "Doctor deleted successfully"));
});
