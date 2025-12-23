import express from "express";
import {
    getDoctorMonthlyCommissionController,
    getDoctorCommissionReportController,
} from "../controllers/commission.controller.js";
import { authMiddleware } from "../middleware/user.middleware.js";

const router = express.Router();

router.use(authMiddleware);

// Get doctor's monthly commission
router.get("/doctor/:doctorId/monthly", getDoctorMonthlyCommissionController);

// Get doctor's commission report
router.get("/doctor/:doctorId/report", getDoctorCommissionReportController);

export default router;
