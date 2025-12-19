import express from "express";
import { loginController } from "../controllers/auth.controller.js";
import { createAdminController } from "../controllers/admin.controller.js";
import { createReceptionistController } from "../controllers/user.controller.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/login", loginController);
router.post("/register", createAdminController);

// Protected routes
router.post("/create-receptionist", authMiddleware, adminMiddleware, createReceptionistController);

// Logout route (placeholder)
router.post("/logout", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully"
  });
});

export default router;
