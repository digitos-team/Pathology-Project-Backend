import Expense from "../models/expense.model.js";
import PathologyLab from "../models/pathologyLab.model.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

// 1. Create Expense
export const createExpenseService = async (data, labId) => {
  // We already have labId from the controller

  let finalAmount = data.amount;

  // If quantity is provided (e.g. for LAB_MATERIALS), calculate Total = Rate * Quantity
  if (data.quantity && data.quantity > 0) {
    finalAmount = data.amount * data.quantity;
  }

  const expense = await Expense.create({
    ...data,
    amount: finalAmount, // Store the calculated total
    lab: labId,
  });

  return expense;
};

// 2. Update Expense
export const updateExpenseService = async (expenseId, updates) => {
  const expense = await Expense.findByIdAndUpdate(expenseId, updates, {
    new: true,
  });
  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }
  return expense;
};

// 3. List Expenses (with optional filters)
export const listExpensesService = async (adminId, query) => {
  const lab = await PathologyLab.findOne({ owner: adminId });
  if (!lab) {
    return {
      data: [],
      pagination: {
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 10,
      },
    };
  }

  const filter = { lab: lab._id };

  // Date Range Filter
  if (query.startDate && query.endDate) {
    const startOfDay = new Date(query.startDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(query.endDate);
    endOfDay.setHours(23, 59, 59, 999);

    filter.date = { $gte: startOfDay, $lte: endOfDay };
  } else if (query.date) {
    const startOfDay = new Date(query.date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(query.date);
    endOfDay.setHours(23, 59, 59, 999);

    filter.date = { $gte: startOfDay, $lte: endOfDay };
  }

  // Category Filter
  if (query.category) {
    filter.category = query.category;
  }

  // Doctor Filter
  if (query.doctor) {
    filter.doctor = query.doctor;
  }

  // 🔹 Pagination Logic
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // 🔹 Count total records
  const totalRecords = await Expense.countDocuments(filter);

  // 🔹 Fetch paginated data
  const expenses = await Expense.find(filter)
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit)
    .populate("lab", "name");

  return {
    data: expenses,
    pagination: {
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: page,
      limit,
    },
  };
};

// 4. Delete Expense
export const deleteExpenseService = async (expenseId) => {
  const expense = await Expense.findByIdAndDelete(expenseId);
  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }
  return expense;
};

// 6. Get Expense Report (Monthly/Yearly)
export const getExpenseReportService = async (labId, type, year, month) => {
  const labObjectId = mongoose.Types.ObjectId.isValid(labId)
    ? new mongoose.Types.ObjectId(labId)
    : null;

  const matchStage = {
    $or: [{ lab: labId }, { lab: labObjectId }].filter((f) => f.lab !== null),
  };

  const targetYear = parseInt(year);
  const targetMonth = parseInt(month) - 1; // JS months are 0-indexed

  let startDate, endDate;

  if (type === "monthly") {
    startDate = new Date(targetYear, targetMonth, 1);
    endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);
  } else if (type === "yearly") {
    startDate = new Date(targetYear, 0, 1);
    endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999);
  } else {
    throw new ApiError(400, "Invalid report type");
  }

  matchStage.date = { $gte: startDate, $lte: endDate };

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: {
          category: "$category",
          // For monthly: group by Day; For yearly: group by Month
          // Use Asia/Kolkata timezone for accurate local day/month grouping
          timeUnit:
            type === "monthly"
              ? { $dayOfMonth: { date: "$date", timezone: "Asia/Kolkata" } }
              : { $month: { date: "$date", timezone: "Asia/Kolkata" } },
        },
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
        items: {
          $push: {
            _id: "$_id",
            title: "$title",
            amount: "$amount",
            date: "$date",
            quantity: "$quantity",
            unit: "$unit",
          },
        }, // Collect detailed items
      },
    },
    {
      $group: {
        _id: "$_id.timeUnit", // Group by Day or Month
        categories: {
          // Renamed from 'expenses' to 'categories' to clarify it contains category-wise breakdown
          $push: {
            category: "$_id.category",
            totalAmount: "$totalAmount",
            count: "$count",
            items: "$items", // Include the details
          },
        },
        totalForPeriod: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } }, // Sort by Day/Month
  ];

  const report = await Expense.aggregate(pipeline);

  // Calculate Grand Total
  const grandTotal = report.reduce(
    (sum, item) => sum + (item.totalForPeriod || 0),
    0
  );

  return {
    breakdown: report,
    grandTotal,
  };
};

// 5. Get Expense by ID
export const getExpenseByIdService = async (expenseId) => {
  const expense = await Expense.findById(expenseId);
  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }
  return expense;
};

// 7. Get Expense Stats (Monthly & Yearly Total)
export const getExpenseStatsService = async (labId) => {
  const labObjectId = mongoose.Types.ObjectId.isValid(labId)
    ? new mongoose.Types.ObjectId(labId)
    : null;

  const now = new Date();
  // Start of Current Month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Start of Current Year
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const pipeline = [
    {
      $match: {
        $or: [{ lab: labId }, { lab: labObjectId }].filter(
          (f) => f.lab !== null
        ),
      },
    },
    {
      $facet: {
        monthly: [
          { $match: { date: { $gte: startOfMonth } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ],
        yearly: [
          { $match: { date: { $gte: startOfYear } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ],
      },
    },
  ];

  const results = await Expense.aggregate(pipeline);

  const monthlyTotal = results[0]?.monthly[0]?.total || 0;
  const yearlyTotal = results[0]?.yearly[0]?.total || 0;

  return { monthlyTotal, yearlyTotal };
};
