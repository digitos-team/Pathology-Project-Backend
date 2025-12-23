import Payment from "../models/payment.model.js";
import Invoice from "../models/invoice.model.js";
import { ApiError } from "../utils/ApiError.js";
import * as billService from "./bill.service.js";
import * as commissionService from "./commission.service.js";
import * as revenueService from "./revenue.service.js";

// Record payment and trigger downstream processes
export const recordPayment = async ({ invoiceId, amount, paymentMethod, transactionId, labId }) => {
    // Validate invoice
    const invoice = await Invoice.findById(invoiceId).populate("doctorId");
    if (!invoice) {
        throw new ApiError(404, "Invoice not found");
    }

    if (invoice.status === "PAID") {
        throw new ApiError(400, "Invoice already paid");
    }

    if (invoice.status === "CANCELLED") {
        throw new ApiError(400, "Cannot pay cancelled invoice");
    }

    // Create payment record
    const payment = await Payment.create({
        invoiceId,
        amount,
        paymentMethod,
        transactionId,
        labId,
    });

    // Update invoice status
    invoice.status = "PAID";
    await invoice.save();

    // Generate bill
    const bill = await billService.generateBill({
        invoiceId: invoice._id,
        paymentId: payment._id,
        patientId: invoice.patientId,
        totalAmount: invoice.totalAmount,
        labId,
    });

    // Calculate and record commission
    const commission = await commissionService.calculateAndRecordCommission({
        doctorId: invoice.doctorId._id,
        doctorCommissionPercent: invoice.doctorId.commissionPercentage,
        totalAmount: invoice.totalAmount,
        invoiceId: invoice._id,
        labId,
    });

    // Record revenue
    const revenue = await revenueService.recordRevenue({
        invoiceId: invoice._id,
        totalAmount: invoice.totalAmount,
        commissionAmount: commission.amount,
        labId,
    });

    return {
        payment,
        bill,
        commission,
        revenue,
    };
};

// Get payments for an invoice
export const getPaymentsByInvoice = async (invoiceId) => {
    return await Payment.find({ invoiceId }).sort({ createdAt: -1 });
};

// Get all payments for a lab
export const getLabPayments = async (labId) => {
    return await Payment.find({ labId })
        .populate("invoiceId")
        .sort({ createdAt: -1 });
};
