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
export const getRevenueStats = async (labId, startDate, endDate) => {
    const labObjectId = mongoose.Types.ObjectId.isValid(labId) ? new mongoose.Types.ObjectId(labId) : null;

    const filter = {
        $or: [
            { labId: labId },
            { labId: labObjectId }
        ].filter(f => f.labId !== null)
    };

    if (startDate && endDate && startDate !== "" && endDate !== "") {
        filter.createdAt = {
            $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
            $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
        };
    }

    const stats = await Revenue.aggregate([
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

    return stats[0] || {
        totalRevenue: 0,
        totalCommission: 0,
        netRevenue: 0,
        count: 0,
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
