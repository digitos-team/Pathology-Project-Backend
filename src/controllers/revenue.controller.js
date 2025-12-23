import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as revenueService from "../services/revenue.service.js";

// Get revenue stats
export const getRevenueStatsController = asyncHandler(async (req, res) => {
    const labId = req.user.labId;
    const { startDate, endDate } = req.query;

    const stats = await revenueService.getRevenueStats(labId, startDate, endDate);
    res.status(200).json(new ApiResponse(200, stats, "Revenue stats fetched successfully"));
});

// Get monthly revenue breakdown
export const getMonthlyRevenueController = asyncHandler(async (req, res) => {
    const labId = req.user.labId;
    const { year } = req.query;

    const monthlyData = await revenueService.getMonthlyRevenue(labId, year || new Date().getFullYear());
    res.status(200).json(new ApiResponse(200, monthlyData, "Monthly revenue fetched successfully"));
});
