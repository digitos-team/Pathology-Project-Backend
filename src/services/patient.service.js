import Patient from "../models/patient.model.js";
import mongoose from "mongoose";

import PathologyLab from "../models/pathologyLab.model.js";

export const createPatient = async (data, userId, labId) => {
  console.log("[SERVICE] createPatient called", { data, userId, labId });

  const patient = await Patient.create({
    ...data,
    createdBy: userId,
    labId: labId,
  });

  return patient;
};

export const getPatientsByLab = async (labId) => {
  const filter = { labId, isActive: true };

  return await Patient.find(filter).sort({ createdAt: -1 });
};

export const getPatientById = async (patientId, labId) => {
  return await Patient.findOne({ _id: patientId, labId }).populate(
    "testHistory"
  );
};

export const updatePatient = async (patientId, labId, updateData) => {
  return await Patient.findOneAndUpdate({ _id: patientId, labId }, updateData, {
    new: true,
  });
};

export const searchPatient = async (labId, query) => {
  const filter = { labId, isActive: true };

  if (query.phone) filter.phone = query.phone;
  if (query.fullName)
    filter.fullName = { $regex: query.fullName, $options: "i" };

  return await Patient.find(filter);
};
