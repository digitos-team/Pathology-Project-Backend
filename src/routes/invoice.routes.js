import express from "express";
import {
    getInvoiceController,
    getPatientInvoicesController,
    getLabInvoicesController,
} from "../controllers/invoice.controller.js";
import { authMiddleware } from "../middleware/user.middleware.js";

const router = express.Router();

router.use(authMiddleware);

// Get invoice by ID
router.get("/:invoiceId", getInvoiceController);

// Get patient invoices
router.get("/patient/:patientId", getPatientInvoicesController);

// Get all lab invoices
router.get("/", getLabInvoicesController);

export default router;
