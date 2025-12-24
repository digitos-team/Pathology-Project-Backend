import Expense from "../models/expense.model.js";
import Doctor from "../models/doctor.model.js";
import { ApiError } from "../utils/ApiError.js";

// Calculate commission and create expense entry
export const calculateAndRecordCommission = async ({ doctorId, doctorCommissionPercent, totalAmount, billId, labId }) => {
    // Calculate commission amount
    const commissionAmount = (totalAmount * doctorCommissionPercent) / 100;

    // Create expense entry for commission
    const expense = await Expense.create({
        title: `Doctor Commission - Bill`,
        amount: commissionAmount,
        category: "COMMISSION",
        doctor: doctorId,
        date: new Date(),
        description: `Commission for Bill ${billId}`,
        labId,
    });

    return {
        amount: commissionAmount,
        percentage: doctorCommissionPercent,
        expenseId: expense._id,
    };
};

// Get doctor's total commission (monthly)
export const getDoctorMonthlyCommission = async (doctorId, year, month) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const result = await Expense.aggregate([
        {
            $match: {
                doctor: doctorId,
                category: "COMMISSION",
                date: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id: null,
                totalCommission: { $sum: "$amount" },
                count: { $sum: 1 },
            },
        },
    ]);

    return result[0] || { totalCommission: 0, count: 0 };
};

// Get doctor's commission report (all time or filtered)
export const getDoctorCommissionReport = async (doctorId, startDate, endDate) => {
    const filter = {
        doctor: doctorId,
        category: "COMMISSION",
    };

    if (startDate && endDate) {
        filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const commissions = await Expense.find(filter).sort({ date: -1 });

    const total = commissions.reduce((sum, exp) => sum + exp.amount, 0);

    return {
        commissions,
        totalCommission: total,
        count: commissions.length,
    };
};
