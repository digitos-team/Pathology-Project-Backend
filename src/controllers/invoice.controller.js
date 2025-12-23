import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import * as invoiceService from "../services/invoice.service.js";

// Get invoice by ID
export const getInvoiceController = asyncHandler(async (req, res) => {
    const { invoiceId } = req.params;
    const invoice = await invoiceService.getInvoiceById(invoiceId);
    res.status(200).json(new ApiResponse(200, invoice, "Invoice fetched successfully"));
});

// Get patient invoices
export const getPatientInvoicesController = asyncHandler(async (req, res) => {
    const { patientId } = req.params;
    const labId = req.user.labId;
    const invoices = await invoiceService.getPatientInvoices(patientId, labId);
    res.status(200).json(new ApiResponse(200, invoices, "Patient invoices fetched successfully"));
});

// Get all lab invoices
export const getLabInvoicesController = asyncHandler(async (req, res) => {
    const labId = req.user.labId;
    const { status } = req.query;
    const invoices = await invoiceService.getLabInvoices(labId, status);
    res.status(200).json(new ApiResponse(200, invoices, "Lab invoices fetched successfully"));
});
