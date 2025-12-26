import Bill from "../models/bill.model.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

// Generate bill (Pending or Paid)
export const generateBill = async ({
  patientId,
  testOrderId,
  testReports,
  items,
  totalAmount,
  labId,
  paymentId,
}) => {
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
    status: paymentId ? "PAID" : "PENDING",
  });

  return bill;
};

// Get bill by ID
export const getBillById = async (billId) => {
  const bill = await Bill.findById(billId)
    .populate("paymentId")
    .populate("patientId", "fullName phone age gender")
    .populate({
      path: "testOrderId",
      populate: { path: "doctor", select: "name" },
    });

  if (!bill) {
    throw new ApiError(404, "Bill not found");
  }

  return bill;
};

// Get bills for a patient
export const getPatientBills = async (patientId, labId) => {
  return await Bill.find({ patientId, labId }).sort({ createdAt: -1 });
};

// Get all bills for a lab
export const getLabBills = async (labId) => {
  return await Bill.find({ labId })
    .populate("patientId", "fullName phone")
    .sort({ createdAt: -1 });
};

// Get Billing Report (Daily/Monthly)
export const getBillingReportService = async (labId, type, year, month) => {
  const match = {
    labId: new mongoose.Types.ObjectId(labId),
  };

  const startDate = new Date(year, month ? month - 1 : 0, 1);
  const endDate = new Date(year, month ? month : 12, 0, 23, 59, 59);

  match.createdAt = { $gte: startDate, $lte: endDate };

  let groupFormat;
  if (type === "daily") {
    groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
  } else {
    groupFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
  }

  const report = await Bill.aggregate([
    { $match: match },
    {
      $lookup: {
        from: "patients",
        localField: "patientId",
        foreignField: "_id",
        as: "patientInfo",
      },
    },
    { $unwind: "$patientInfo" },
    {
      $group: {
        _id: groupFormat,
        totalAmount: { $sum: "$totalAmount" },
        paidAmount: {
          $sum: { $cond: [{ $eq: ["$status", "PAID"] }, "$totalAmount", 0] },
        },
        pendingAmount: {
          $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, "$totalAmount", 0] },
        },
        billCount: { $sum: 1 },
        bills: {
          $push: {
            billNumber: "$billNumber",
            patientName: "$patientInfo.fullName",
            amount: "$totalAmount",
            status: "$status",
            date: "$createdAt",
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return report;
};
