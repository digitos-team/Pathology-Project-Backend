import express from "express";
import {
    recordPaymentController,
    getInvoicePaymentsController,
    getLabPaymentsController,
} from "../controllers/payment.controller.js";
import { authMiddleware } from "../middleware/user.middleware.js";

const router = express.Router();

router.use(authMiddleware);

// Record payment
router.post("/record", recordPaymentController);

// Get payments for invoice
router.get("/invoice/:invoiceId", getInvoicePaymentsController);

// Get all lab payments
router.get("/", getLabPaymentsController);

export default router;
