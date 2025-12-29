import Revenue from "../models/revenue.model.js";
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
        lab: labId,
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

export const getDetailedDoctorCommission = async (doctorId, startDate, endDate) => {
    // 1. Fetch Revenues with deep population to find bills linked to this doctor
    // Note: We scan Revenues within date range, then filter by doctor
    const dateFilter = {};
    if (startDate && endDate) {
        dateFilter.createdAt = {
            $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
            $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
        };
    }

    const revenues = await Revenue.find(dateFilter)
        .populate({
            path: 'billId',
            populate: [
                {
                    path: 'testOrderId', // To get doctor
                    populate: { path: 'doctor' }
                },
                {
                    path: 'patientId', // To get patient name
                    select: 'fullName'
                }
            ]
        })
        .sort({ createdAt: -1 });

    // 2. Filter for specific doctor and format
    const detailedCommissions = revenues
        .filter(rev => {
            const docId = rev.billId?.testOrderId?.doctor?._id?.toString();
            return docId === doctorId.toString() && rev.commissionAmount > 0;
            // Also ensure commission > 0
        })
        .map(rev => ({
            date: rev.createdAt,
            patientName: rev.billId?.patientId?.fullName || "Unknown",
            billNumber: rev.billId?.billNumber,
            totalBillAmount: rev.totalAmount,
            commissionAmount: rev.commissionAmount,
            doctorName: rev.billId?.testOrderId?.doctor?.name,
            testOrder: rev.billId?.items?.map(i => i.name).join(", ")
        }));

    return detailedCommissions;
};

// Get ALL commissions (for Admin) with filters
// Get ALL commissions (for Admin) with filters
export const getAllCommissionsService = async (labId, startDate, endDate, page = 1, limit = 10) => {
    const filter = {
        lab: labId,
        category: "COMMISSION"
    };

    if (startDate && endDate) {
        filter.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const skip = (page - 1) * limit;

    const [commissions, totalRecords] = await Promise.all([
        Expense.find(filter)
            .populate("doctor", "name specialization email phone") // Populate doctor details
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit),
        Expense.countDocuments(filter)
    ]);

    return {
        data: commissions,
        pagination: {
            totalRecords,
            totalPages: Math.ceil(totalRecords / limit),
            currentPage: Number(page),
            limit: Number(limit)
        }
    };
};
