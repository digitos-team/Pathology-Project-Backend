import Invoice from "../models/invoice.model.js";
import { ApiError } from "../utils/ApiError.js";

// Generate invoice after test assignment
export const generateInvoice = async ({ patientId, doctorId, testReports, items, totalAmount, labId }) => {
    const invoice = await Invoice.create({
        patientId,
        doctorId,
        testReports,
        items,
        totalAmount,
        status: "PENDING",
        labId,
    });

    return invoice;
};

// Get invoice by ID
export const getInvoiceById = async (invoiceId) => {
    const invoice = await Invoice.findById(invoiceId)
        .populate("patientId", "fullName phone age gender")
        .populate("doctorId", "name specialization")
        .populate("testReports");

    if (!invoice) {
        throw new ApiError(404, "Invoice not found");
    }

    return invoice;
};

// Get all invoices for a patient
export const getPatientInvoices = async (patientId, labId) => {
    return await Invoice.find({ patientId, labId })
        .populate("doctorId", "name")
        .sort({ createdAt: -1 });
};

// Get all invoices for a lab
export const getLabInvoices = async (labId, status) => {
    const filter = { labId };
    if (status) filter.status = status;

    return await Invoice.find(filter)
        .populate("patientId", "fullName phone")
        .populate("doctorId", "name")
        .sort({ createdAt: -1 });
};

// Update invoice status
export const updateInvoiceStatus = async (invoiceId, status) => {
    const invoice = await Invoice.findByIdAndUpdate(
        invoiceId,
        { status },
        { new: true }
    );

    if (!invoice) {
        throw new ApiError(404, "Invoice not found");
    }

    return invoice;
};
