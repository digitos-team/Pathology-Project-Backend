import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as commissionService from "../services/commission.service.js";

// Get doctor's monthly commission
export const getDoctorMonthlyCommissionController = asyncHandler(async (req, res) => {
    const { doctorId } = req.params;
    const { year, month } = req.query;

    const commission = await commissionService.getDoctorMonthlyCommission(
        doctorId,
        year || new Date().getFullYear(),
        month || new Date().getMonth() + 1
    );

    res.status(200).json(new ApiResponse(200, commission, "Monthly commission fetched successfully"));
});

// Get doctor's commission report
export const getDoctorCommissionReportController = asyncHandler(async (req, res) => {
    const { doctorId } = req.params;
    const { startDate, endDate } = req.query;

    const report = await commissionService.getDoctorCommissionReport(doctorId, startDate, endDate);
    res.status(200).json(new ApiResponse(200, report, "Commission report fetched successfully"));
});
