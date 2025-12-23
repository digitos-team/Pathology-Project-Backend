import express from "express";
import {
    getBillController,
    getPatientBillsController,
    getLabBillsController,
} from "../controllers/bill.controller.js";
import { authMiddleware } from "../middleware/user.middleware.js";

const router = express.Router();

router.use(authMiddleware);

// Get bill by ID
router.get("/:billId", getBillController);

// Get patient bills
router.get("/patient/:patientId", getPatientBillsController);

// Get all lab bills
router.get("/", getLabBillsController);

export default router;
