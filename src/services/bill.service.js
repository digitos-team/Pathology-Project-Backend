import Bill from "../models/bill.model.js";
import { ApiError } from "../utils/ApiError.js";

// Generate bill (Pending or Paid)
export const generateBill = async ({ patientId, testOrderId, testReports, items, totalAmount, labId, paymentId }) => {
    // Generate Bill Number
    const count = await Bill.countDocuments();
    const billNumber = `BILL-${Date.now()}-${count + 1}`;

    const bill = await Bill.create({
        billNumber,
        patientId,
        testOrderId,
        testReports,
        items,
        totalAmount,
        labId,
        // Optional paymentId
        paymentId,
        status: paymentId ? "PAID" : "PENDING"
    });

    return bill;
};

// Get bill by ID
export const getBillById = async (billId) => {
    const bill = await Bill.findById(billId)
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
        .sort({ createdAt: -1 });
};

// Get all bills for a lab
export const getLabBills = async (labId) => {
    return await Bill.find({ labId })
        .populate("patientId", "fullName phone")
        .sort({ createdAt: -1 });
};
