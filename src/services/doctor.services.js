import Doctor from "../models/doctor.model.js";
import PathologyLab from "../models/pathologyLab.model.js";
import Expense from "../models/expense.model.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

export const createDoctorService = async (doctorData, adminId) => {
    // Find the lab associated with this admin
    const lab = await PathologyLab.findOne({ owner: adminId });
    if (!lab) {
        throw new ApiError(404, "No Lab found for this Admin. Please update Lab Details first.");
    }

    const doctor = await Doctor.create({
        ...doctorData,
        lab: lab._id
    });

    return doctor;
};

export const updateDoctorService = async (doctorId, updates) => {
    const doctor = await Doctor.findByIdAndUpdate(doctorId, updates, { new: true });
    if (!doctor) {
        throw new ApiError(404, "Doctor not found");
    }
    return doctor;
};

export const getAllDoctorsService = async (adminId) => {
    const lab = await PathologyLab.findOne({ owner: adminId });
    if (!lab) {
        return [];
    }
    const doctors = await Doctor.find({ lab: lab._id });
    return doctors;
};

export const getDoctorCommissionReportService = async (doctorId, type) => {
    if (!doctorId) throw new ApiError(400, "Doctor ID is required");

    let groupFormat;
    if (type === 'daily') {
        groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$date" } };
    } else if (type === 'monthly') {
        groupFormat = { $dateToString: { format: "%Y-%m", date: "$date" } };
    } else if (type === 'yearly') {
        groupFormat = { $dateToString: { format: "%Y", date: "$date" } };
    } else {
        throw new ApiError(400, "Invalid report type. Use daily, monthly, or yearly.");
    }

    const report = await Expense.aggregate([
        {
            $match: {
                doctor: new mongoose.Types.ObjectId(doctorId),
                category: 'COMMISSION'
            }
        },
        {
            $group: {
                _id: groupFormat,
                totalCommission: { $sum: "$amount" },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: -1 } }
    ]);

    return report;
};
