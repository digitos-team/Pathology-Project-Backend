import express from "express";
import {
    addExpenseController,
    updateExpenseController,
    listExpensesController,
    deleteExpenseController,
    getExpenseByIdController,
    getExpenseReportController,
    downloadExpenseReportController,
    getExpenseStatsController
} from "../controllers/expense.controller.js";
import { authMiddleware, adminMiddleware } from "../middleware/user.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

// All routes are protected for Admin
router.use(authMiddleware, adminMiddleware);

router.post("/add", upload.single("receipt"), addExpenseController);
router.put("/update/:expenseId", upload.single("receipt"), updateExpenseController);
router.get("/all", listExpensesController);
router.delete("/delete/:expenseId", deleteExpenseController);
router.get("/reports/download", downloadExpenseReportController); // New Download Route (Must be before :expenseId)
router.get("/reports", getExpenseReportController);
router.get("/stats", getExpenseStatsController); // Stats Route
router.get("/:expenseId", getExpenseByIdController);

export default router;
