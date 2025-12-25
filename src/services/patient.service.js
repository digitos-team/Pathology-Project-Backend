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

export const getPatientsByLab = async (userId, options = {}) => {
  // Get pagination parameters with defaults
  const page = Math.max(1, parseInt(options.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(options.limit) || 10));
  const skip = (page - 1) * limit;

  // Get search and filter parameters
  const search = options.search || "";
  const gender = options.gender || "";
  const sortBy = options.sortBy || "createdAt";
  const sortOrder = options.sortOrder === "asc" ? 1 : -1;
  const ageMin = options.ageMin || "";
  const ageMax = options.ageMax || "";

  // Get labId
  const labId = await getLabIdByOwner(userId);

  // Build query filter
  const filter = { labId, isActive: true };

  // Add search functionality (name or phone)
  if (search && search.trim() !== "") {
    filter.$or = [
      { fullName: { $regex: search.trim(), $options: "i" } },
      { phone: { $regex: search.trim(), $options: "i" } },
    ];
  }

  // Filter by gender
  if (gender && gender !== "") {
    filter.gender = gender;
  }

  // Filter by age range
  if (ageMin !== "" || ageMax !== "") {
    filter.age = {};
    if (ageMin !== "") filter.age.$gte = parseInt(ageMin);
    if (ageMax !== "") filter.age.$lte = parseInt(ageMax);
  }

  // Build sort object
  const sort = { [sortBy]: sortOrder };

  // Execute queries in parallel for better performance
  const [patients, totalCount] = await Promise.all([
    Patient.find(filter)
      .select("fullName phone age gender address createdAt updatedAt")
      .populate("createdBy", "name email") // If you want to populate createdBy
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(), // Use lean() for better performance
    Patient.countDocuments(filter),
  ]);

  // Calculate pagination metadata
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    patients,
    pagination: {
      currentPage: page,
      totalPages,
      totalRecords: totalCount,
      recordsPerPage: limit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
    },
  };
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
