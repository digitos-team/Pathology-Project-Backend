import Revenue from "../models/revenue.model.js";
import { ApiError } from "../utils/ApiError.js";

// Record revenue after payment
export const recordRevenue = async ({ invoiceId, totalAmount, commissionAmount, labId }) => {
    const netRevenue = totalAmount - commissionAmount;

    const revenue = await Revenue.create({
        invoiceId,
        totalAmount,
        commissionAmount,
        netRevenue,
        labId,
    });

    return revenue;
};

// Get revenue stats
export const getRevenueStats = async (labId, startDate, endDate) => {
    const filter = { labId };

    if (startDate && endDate) {
        filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
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

    const monthlyData = await Revenue.aggregate([
        {
            $match: {
                labId,
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
