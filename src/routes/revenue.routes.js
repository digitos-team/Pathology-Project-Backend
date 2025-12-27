import express from "express";
import {
    getRevenueStatsController,
    getMonthlyRevenueController,
    getDailyRevenueController
} from "../controllers/revenue.controller.js";
import { authMiddleware, adminMiddleware } from "../middleware/user.middleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware); // Only admin can view revenue

// Get revenue stats
router.get("/stats", getRevenueStatsController);

// Get monthly revenue
router.get("/monthly", getMonthlyRevenueController);

// Get daily revenue
router.get("/daily", getDailyRevenueController);

export default router;
