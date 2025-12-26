import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as revenueService from "../services/revenue.service.js";

// Get revenue stats
export const getRevenueStatsController = asyncHandler(async (req, res) => {
    const labId = req.user.labId;
    const query = req.query;

    const result = await revenueService.getRevenueWithPaginationService(
        labId,
        query
    );

    res.status(200).json(
        new ApiResponse(200, result, "Revenue fetched successfully")
    );
});

// Get monthly revenue breakdown
export const getMonthlyRevenueController = asyncHandler(async (req, res) => {
    const labId = req.user.labId;
    const { year } = req.query;

    const monthlyData = await revenueService.getMonthlyRevenue(labId, year || new Date().getFullYear());
    res.status(200).json(new ApiResponse(200, monthlyData, "Monthly revenue fetched successfully"));
});

// Get daily revenue breakdown
export const getDailyRevenueController = asyncHandler(async (req, res) => {
  const { year, month } = req.query;
 
  
  const labId = req.user.labId
  console.log(labId);
  

  if (!year || !month) {
    return res.status(400).json(
      new ApiResponse(400, null, "Year and month are required")
    );
  }

  const data = await revenueService.getDailyRevenue(
    labId,
    Number(year),
    Number(month)
  );

  res.status(200).json(
    new ApiResponse(200, data, "Daily revenue fetched successfully")
  );
});
