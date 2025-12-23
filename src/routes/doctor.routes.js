import express from "express";
import {
    addDoctorController,
    updateDoctorController,
    getAllDoctorsController,
    getDoctorCommissionReportController
} from "../controllers/doctor.controller.js";
import { authMiddleware, adminMiddleware } from "../middleware/user.middleware.js";

const router = express.Router();

// All routes are protected for Admin
router.use(authMiddleware, adminMiddleware);

router.post("/add", addDoctorController);
router.put("/update/:doctorId", updateDoctorController);
router.get("/all", getAllDoctorsController);
router.get("/reports/:doctorId", getDoctorCommissionReportController);

export default router;
