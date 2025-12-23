import express from "express";
import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  searchPatient,
} from "../controllers/patient.controller.js";

import { authMiddleware, adminMiddleware } from "../middleware/user.middleware.js";
// import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// All routes protected
router.use(authMiddleware);

// Register patient
router.post(
  "/",
  authMiddleware,
  createPatient
);

// Get all patients (lab-wise)
router.get("/", getPatients);

// Search patient
router.get("/search", searchPatient);

// Patient profile
router.get("/:id", getPatientById);

// Update patient
router.put(
  "/:id",
  adminMiddleware,
  updatePatient
);

export default router;
