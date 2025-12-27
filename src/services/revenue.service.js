import Revenue from "../models/revenue.model.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

// Record revenue after payment
export const recordRevenue = async ({ billId, totalAmount, commissionAmount, labId }) => {
    const netRevenue = totalAmount - commissionAmount;

    const revenue = await Revenue.create({
        billId,
        totalAmount,
        commissionAmount,
        netRevenue,
        labId: new mongoose.Types.ObjectId(labId),
    });

    return revenue;
};

// Get revenue stats
export const getRevenueWithPaginationService = async (labId,query) => {
    const labObjectId = mongoose.Types.ObjectId.isValid(labId)
        ? new mongoose.Types.ObjectId(labId)
        : null;

    const filter = {
        $or: [
            { labId: labId },
            labObjectId ? { labId: labObjectId } : null
        ].filter(Boolean)
    };

    // Date filter
    if (query.startDate && query.endDate) {
        filter.createdAt = {
            $gte: new Date(new Date(query.startDate).setHours(0, 0, 0, 0)),
            $lte: new Date(new Date(query.endDate).setHours(23, 59, 59, 999)),
        };
    }

    // 🔹 Pagination
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // 🔹 Stats (Aggregation)
    const statsAgg = await Revenue.aggregate([
        { $match: filter },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$totalAmount" },
                totalCommission: { $sum: "$commissionAmount" },
                netRevenue: { $sum: "$netRevenue" },
                count: { $sum: 1 },
            },
        },
    ]);

    const stats = statsAgg[0] || {
        totalRevenue: 0,
        totalCommission: 0,
        netRevenue: 0,
        count: 0,
    };

    // 🔹 Count for pagination
    const totalRecords = await Revenue.countDocuments(filter);

    // 🔹 Paginated list
    const revenues = await Revenue.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("billId");

    return {
        stats,
        data: revenues,
        pagination: {
            totalRecords,
            totalPages: Math.ceil(totalRecords / limit),
            currentPage: page,
            limit,
        },
    };
};

// Get monthly revenue breakdown
export const getMonthlyRevenue = async (labId, year) => {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const labObjectId = mongoose.Types.ObjectId.isValid(labId) ? new mongoose.Types.ObjectId(labId) : null;

    const monthlyData = await Revenue.aggregate([
        {
            $match: {
                $or: [
                    { labId: labId },
                    { labId: labObjectId }
                ].filter(f => f.labId !== null),
                createdAt: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id: { $month: "$createdAt" },
                totalRevenue: { $sum: "$totalAmount" },
                totalCommission: { $sum: "$commissionAmount" },
                netRevenue: { $sum: "$netRevenue" },
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    return monthlyData;
};

//get per Day Revenue
export const getDailyRevenue = async (labId, year, month) => {
  // month = 1-12
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const labObjectId = mongoose.Types.ObjectId.isValid(labId)
    ? new mongoose.Types.ObjectId(labId)
    : null;

  const dailyData = await Revenue.aggregate([
    {
      $match: {
        $or: [
          { labId: labId },
          { labId: labObjectId }
        ].filter(f => f.labId !== null),
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" }
        },
        totalRevenue: { $sum: "$totalAmount" },
        totalCommission: { $sum: "$commissionAmount" },
        netRevenue: { $sum: "$netRevenue" },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { "_id.day": 1 }
    }
  ]);

  return dailyData;
};
