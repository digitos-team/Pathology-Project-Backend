import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import * as paymentService from "../services/payment.service.js";

// Record payment (triggers bill, commission, revenue)
export const recordPaymentController = asyncHandler(async (req, res) => {
    const { invoiceId, amount, paymentMethod, transactionId } = req.body;
    const labId = req.user.labId;

    if (!invoiceId || !amount || !paymentMethod) {
        throw new ApiError(400, "Invoice ID, amount, and payment method are required");
    }

    const result = await paymentService.recordPayment({
        invoiceId,
        amount,
        paymentMethod,
        transactionId,
        labId,
    });

    res.status(201).json(new ApiResponse(201, result, "Payment recorded and bill generated successfully"));
});

// Get payments for invoice
export const getInvoicePaymentsController = asyncHandler(async (req, res) => {
    const { invoiceId } = req.params;
    const payments = await paymentService.getPaymentsByInvoice(invoiceId);
    res.status(200).json(new ApiResponse(200, payments, "Payments fetched successfully"));
});

// Get all lab payments
export const getLabPaymentsController = asyncHandler(async (req, res) => {
    const labId = req.user.labId;
    const payments = await paymentService.getLabPayments(labId);
    res.status(200).json(new ApiResponse(200, payments, "Lab payments fetched successfully"));
});
