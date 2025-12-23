import Bill from "../models/bill.model.js";
import { ApiError } from "../utils/ApiError.js";

// Generate bill after payment
export const generateBill = async ({ invoiceId, paymentId, patientId, totalAmount, labId }) => {
    const bill = await Bill.create({
        invoiceId,
        paymentId,
        patientId,
        totalAmount,
        labId,
    });

    return bill;
};

// Get bill by ID
export const getBillById = async (billId) => {
    const bill = await Bill.findById(billId)
        .populate("invoiceId")
        .populate("paymentId")
        .populate("patientId", "fullName phone age gender");

    if (!bill) {
        throw new ApiError(404, "Bill not found");
    }

    return bill;
};

// Get bills for a patient
export const getPatientBills = async (patientId, labId) => {
    return await Bill.find({ patientId, labId })
        .populate("invoiceId")
        .sort({ createdAt: -1 });
};

// Get all bills for a lab
export const getLabBills = async (labId) => {
    return await Bill.find({ labId })
        .populate("patientId", "fullName phone")
        .populate("invoiceId")
        .sort({ createdAt: -1 });
};
