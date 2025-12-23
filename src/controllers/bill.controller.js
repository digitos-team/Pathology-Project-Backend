import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as billService from "../services/bill.service.js";

// Get bill by ID
export const getBillController = asyncHandler(async (req, res) => {
    const { billId } = req.params;
    const bill = await billService.getBillById(billId);
    res.status(200).json(new ApiResponse(200, bill, "Bill fetched successfully"));
});

// Get patient bills
export const getPatientBillsController = asyncHandler(async (req, res) => {
    const { patientId } = req.params;
    const labId = req.user.labId;
    const bills = await billService.getPatientBills(patientId, labId);
    res.status(200).json(new ApiResponse(200, bills, "Patient bills fetched successfully"));
});

// Get all lab bills
export const getLabBillsController = asyncHandler(async (req, res) => {
    const labId = req.user.labId;
    const bills = await billService.getLabBills(labId);
    res.status(200).json(new ApiResponse(200, bills, "Lab bills fetched successfully"));
});
