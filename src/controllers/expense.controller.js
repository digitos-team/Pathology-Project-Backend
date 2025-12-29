import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import PDFDocument from "pdfkit";
import { ApiError } from "../utils/ApiError.js";
import { generateExpenseReportPDF } from "../utils/pdfGenerator.js";
import {
  createExpenseService,
  updateExpenseService,
  listExpensesService,
  deleteExpenseService,
  getExpenseByIdService,
  getExpenseReportService,
  getExpenseStatsService,
} from "../services/expense.services.js";

// 1. Add Expense
export const addExpenseController = asyncHandler(async (req, res) => {
  const labId = req.user.labId;
  if (!labId) {
    throw new ApiError(
      400,
      "Lab ID is missing from your session. Please re-login."
    );
  }
  const expenseData = req.body;

  // Handle File Upload
  if (req.file) {
    // Path relative to public folder to be served as static asset
    // e.g., "temp/filename.jpg" -> Client accesses via BaseURL + "/temp/filename.jpg"
    // Since we served "public" as static root, we store "temp/filename"
    expenseData.receiptUrl = `temp/${req.file.filename}`;
  }

  const expense = await createExpenseService(expenseData, labId);

  res
    .status(201)
    .json(new ApiResponse(201, expense, "Expense added successfully"));
});

// 2. Update Expense
export const updateExpenseController = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;
  const updates = req.body;
  if (req.file) {
    // Path relative to public folder to be served as static asset
    // e.g., "temp/filename.jpg" -> Client accesses via BaseURL + "/temp/filename.jpg"
    // Since we served "public" as static root, we store "temp/filename"
    updates.receiptUrl = `temp/${req.file.filename}`;
  }
  const expense = await updateExpenseService(expenseId, updates);

  res.json(new ApiResponse(200, expense, "Expense updated successfully"));
});

// 3. List Expenses

export const listExpensesController = asyncHandler(async (req, res) => {
  const adminId = req.user.userId;
  const query = req.query; // e.g., ?date=2023-10-27&category=RENT
  const expenses = await listExpensesService(adminId, query);

  res.json(new ApiResponse(200, expenses, "Expenses fetched successfully"));
});

// 4. Delete Expense
export const deleteExpenseController = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;

  await deleteExpenseService(expenseId);

  res.json(new ApiResponse(200, {}, "Expense deleted successfully"));
});

// 5. Get Expense By ID
export const getExpenseByIdController = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;

  const expense = await getExpenseByIdService(expenseId);

  res.json(
    new ApiResponse(200, expense, "Expense details fetched successfully")
  );
});

// 6. Get Expense Report
export const getExpenseReportController = asyncHandler(async (req, res) => {
  const labId = req.user.labId;
  if (!labId) {
    throw new ApiError(
      400,
      "Lab ID is missing from your session. Please re-login."
    );
  }
  const { type, year, month } = req.query;

  if (!type || !year) {
    throw new ApiError(400, "Type and Year are required");
  }

  if (type === "monthly" && !month) {
    throw new ApiError(400, "Month is required for monthly reports");
  }

  const report = await getExpenseReportService(labId, type, year, month);

  res.json(new ApiResponse(200, report, "Expense report fetched successfully"));
});

// 7. Download Expense Report (PDF)
export const downloadExpenseReportController = asyncHandler(
  async (req, res) => {
    const labId = req.user.labId;
    if (!labId) {
      throw new ApiError(
        400,
        "Lab ID is missing from your session. Please re-login."
      );
    }
    const { type, year, month } = req.query;

    if (!type || !year) {
      throw new ApiError(400, "Type and Year are required");
    }

    // Reuse service logic to get data
    // reportData contains { breakdown, grandTotal }
    const reportData = await getExpenseReportService(
      labId,
      type,
      year,
      month
    );

    // Create PDF Document
    const doc = new PDFDocument({ margin: 30 });

    // Set Response Headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Expense_Report_${year}_${type}.pdf`
    );

    // Pipe PDF to Response
    doc.pipe(res);

    // Generate Content using Utility
    generateExpenseReportPDF(doc, reportData.breakdown, type, year, month);

    // Finalize PDF
    doc.end();
  }
);

// 8. Get Expense Stats
export const getExpenseStatsController = asyncHandler(async (req, res) => {
  const labId = req.user.labId;
  if (!labId) {
    throw new ApiError(
      400,
      "Lab ID is missing from your session. Please re-login."
    );
  }
  const stats = await getExpenseStatsService(labId);
  res.json(new ApiResponse(200, stats, "Expense stats fetched successfully"));
});
