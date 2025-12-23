import * as patientService from "../services/patient.service.js";

// Register Patient
export const createPatient = async (req, res) => {
  try {
    console.log("[CONTROLLER] createPatient", {
      body: req.body,
      userId: req.user.userId,
      labId: req.user.labId,
    });

    const patient = await patientService.createPatient(
      req.body,
      req.user.userId,
      req.user.labId
    );

    res.status(201).json({
      message: "Patient registered successfully",
      data: patient,
    });
  } catch (error) {
    console.error("[ERROR] createPatient", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Patient already exists in this lab",
      });
    }

    res.status(500).json({ message: error.message });
  }
};

// Get All Patients
export const getPatients = async (req, res) => {
  console.log("[CONTROLLER] getPatients", req.user.labId);

  if (!req.user.labId) {
    console.error("[ERROR] Lab ID missing in user token");
    return res.status(400).json({ message: "Lab ID missing. Please login again." });
  }

  const patients = await patientService.getPatientsByLab(req.user.labId);
  res.json(patients);
};



// Get Patient Profile
export const getPatientById = async (req, res) => {
  console.log("[CONTROLLER] getPatientById", req.params.id);

  if (!req.user.labId) {
    return res.status(400).json({ message: "Lab ID missing in token. Please login again." });
  }

  const patient = await patientService.getPatientById(
    req.params.id,
    req.user.labId
  );

  if (!patient) {
    console.warn("[WARN] Patient not found", req.params.id);
    return res.status(404).json({ message: "Patient not found" });
  }

  res.json(patient);
};

// Update Patient
export const updatePatient = async (req, res) => {
  console.log("[CONTROLLER] updatePatient", {
    id: req.params.id,
    body: req.body,
  });

  if (!req.user.labId) {
    return res.status(400).json({ message: "Lab ID missing in token. Please login again." });
  }

  const patient = await patientService.updatePatient(
    req.params.id,
    req.user.labId,
    req.body
  );

  if (!patient) {
    console.warn("[WARN] Patient not found for update", req.params.id);
    return res.status(404).json({ message: "Patient not found" });
  }

  res.json({
    message: "Patient updated successfully",
    data: patient,
  });
};

// Search Patient
export const searchPatient = async (req, res) => {
  console.log("[CONTROLLER] searchPatient", req.query);

  if (!req.user.labId) {
    return res.status(400).json({ message: "Lab ID missing in token. Please login again." });
  }

  const patients = await patientService.searchPatient(
    req.user.labId,
    req.query
  );

  res.json(patients);
};
