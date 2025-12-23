import Patient from "../models/patient.model.js";
import mongoose from "mongoose";

import PathologyLab from "../models/pathologyLab.model.js";

// Helper to get Lab ID
const getLabIdByOwner = async (userId) => {
  const lab = await PathologyLab.findOne({ owner: userId });
  if (!lab) {
    throw new Error("No Lab found for this Admin. Please create a Lab first.");
  }
  return lab._id;
};

export const createPatient = async (data, userId) => {
  console.log("[SERVICE] createPatient called", { data, userId });
  const labId = await getLabIdByOwner(userId);

  const patient = await Patient.create({
    ...data,
    createdBy: userId,
    labId: labId,
  });

  return patient;
};

export const getPatientsByLab = async (userId) => {
  const labId = await getLabIdByOwner(userId);
  const filter = { labId, isActive: true };

  return await Patient.find(filter).sort({ createdAt: -1 });
};

export const getPatientById = async (patientId, userId) => {
  const labId = await getLabIdByOwner(userId);
  return await Patient.findOne({ _id: patientId, labId }).populate("testHistory");
};

export const updatePatient = async (patientId, userId, updateData) => {
  const labId = await getLabIdByOwner(userId);
  return await Patient.findOneAndUpdate(
    { _id: patientId, labId },
    updateData,
    { new: true }
  );
};

export const searchPatient = async (userId, query) => {
  const labId = await getLabIdByOwner(userId);
  const filter = { labId, isActive: true };

  if (query.phone) filter.phone = query.phone;
  if (query.fullName)
    filter.fullName = { $regex: query.fullName, $options: "i" };

  return await Patient.find(filter);
};
