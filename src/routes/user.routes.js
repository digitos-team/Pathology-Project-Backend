import express from "express";
import {
    registerUserController,
    updateUserController,
    updateLabDetailsController,
    loginController,
    deleteReceptionistController
} from "../controllers/user.controller.js";
import { authMiddleware, adminMiddleware, optionalAuthMiddleware } from "../middleware/user.middleware.js";


const router = express.Router();


// Public routes
router.post("/login", loginController);

// Unified Register Endpoint (Handles Public Admin & Protected Receptionist creation)
router.post("/register", optionalAuthMiddleware, registerUserController);

// Protected routes (Aliases for clarity, but /register handles them now)
// router.post("/create-receptionist", authMiddleware, adminMiddleware, registerUserController);



// Protected routes (Admin only)
router.put("/lab-details",
    authMiddleware,
    adminMiddleware,
    updateLabDetailsController);

// Unified User Registration (Admin creates other admins or receptionists)
// router.post("/register-user", authMiddleware, adminMiddleware, registerUserController);

// Profile updates
// Profile updates
router.put("/update-profile", authMiddleware, adminMiddleware, updateUserController);

// Delete Receptionist
router.delete("/delete-receptionist/:userId", authMiddleware, adminMiddleware, deleteReceptionistController);



// Logout route
router.post("/logout", authMiddleware, (req, res) => {
    res.clearCookie("accessToken");
    res.json({
        success: true,
        message: "Logged out successfully"
    });
});

export default router;
