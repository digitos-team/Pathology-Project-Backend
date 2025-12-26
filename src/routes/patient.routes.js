import express from "express";
import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  searchPatient,
  getDailyPatient,
} from "../controllers/patient.controller.js";

import { authMiddleware, adminMiddleware } from "../middleware/user.middleware.js";
// import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

// All routes protected
router.use(authMiddleware);

// Register patient
router.post(
  "/add",
  authMiddleware,
  createPatient
);

// Get all patients (lab-wise)
router.get("/getallpatient", getPatients);

// Search patient
router.get("/search", searchPatient);

// Patient profile
router.get("/getpatientbyid/:id", getPatientById);

// Update patient
router.put(
  "updatepatient/:id",
  adminMiddleware,
  updatePatient
);

router.get("/daily", getDailyPatient);
export default router;
