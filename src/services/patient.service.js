import Patient from "../models/patient.model.js";
import mongoose from "mongoose";

export const createPatient = async (data, userId, labId) => {
  console.log("[SERVICE] createPatient called", { data, userId, labId });

  const patient = await Patient.create({
    ...data,
    userId,
    labId,
  });

  console.log("[SERVICE] Patient created", patient._id);
  return patient;
};

export const getPatientsByLab = async (labId) => {
  console.log("-----------------------------------------");
  console.log("[SERVICE] getPatientsByLab INITIATED");
  console.log("[SERVICE] Received labId:", labId);
  
  try {
    const objectId = new mongoose.Types.ObjectId(labId);
    console.log("[SERVICE] Casted ObjectId:", objectId);

    const filter = {
      labId: objectId,
      isActive: true,
    };
    console.log("[SERVICE] Query Filter:", JSON.stringify(filter));

    const patients = await Patient.find(filter).sort({ createdAt: -1 });
    console.log("[SERVICE] Patients found in DB:", patients.length);
    console.log("-----------------------------------------");

    return patients;
  } catch (error) {
    console.error("[SERVICE] Error in getPatientsByLab:", error);
    throw error;
  }
};

export const getPatientById = async (patientId, labId) => {
  console.log("[SERVICE] getPatientById", { patientId, labId });

  const patient = await Patient.findOne({ _id: patientId, labId })
    .populate("testHistory");

  console.log("[SERVICE] Patient found:", !!patient);
  return patient;
};

export const updatePatient = async (patientId, labId, updateData) => {
  console.log("[SERVICE] updatePatient", {
    patientId,
    labId,
    updateData,
  });

  const patient = await Patient.findOneAndUpdate(
    { _id: patientId, labId },
    updateData,
    { new: true }
  );

  console.log("[SERVICE] Updated patient:", !!patient);
  return patient;
};

export const searchPatient = async (labId, query) => {
  console.log("[SERVICE] searchPatient", { labId, query });

  const filter = { labId, isActive: true };

  if (query.phone) filter.phone = query.phone;
  if (query.fullName)
    filter.fullName = { $regex: query.fullName, $options: "i" };

  console.log("[SERVICE] Search filter:", filter);

  const patients = await Patient.find(filter);
  console.log("[SERVICE] Search result count:", patients.length);

  return patients;
};
