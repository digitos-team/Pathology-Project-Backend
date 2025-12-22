// user.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as userService from "../services/user.service.js";
import * as authService from "../services/auth.service.js";
import {

  validateCreateReceptionistRequest,
  validateLoginRequest
} from "../validations/user.validation.js";
import { ApiError } from "../utils/ApiError.js";

export const registerUserController = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const loggedInUser = req.user;

  // 🔒 Authentication check (non-negotiable)
  if (!loggedInUser) {
    throw new ApiError(401, "Authentication required");
  }

  // 🔒 STRICT ROLE RULES
  if (role === "RECEPTIONIST") {
    if (loggedInUser.role !== "ADMIN") {
      throw new ApiError(403, "Only admin can create receptionist");
    }

    validateCreateReceptionistRequest(req.body);
  }
  else {
    // ❌ No admin creation via this API
    throw new ApiError(403, "Invalid or forbidden role creation");
  }

  const user = await userService.registerUserService({
    name,
    email,
    password,
    role: "RECEPTIONIST",
    createdBy: loggedInUser.userId,
  });

  res
    .status(201)
    .json(new ApiResponse(201, user, "Receptionist created successfully"));
});
export const loginController = asyncHandler(async (req, res) => {
  validateLoginRequest(req.body);
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);
  res.json(new ApiResponse(200, result, "Login successful"));
});

export const updateUserController = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const updated = await userService.updateUserService(userId, req.body);
  res.json(new ApiResponse(200, updated, "User profile updated"));
});

export const updateLabDetailsController = asyncHandler(async (req, res) => {
  const adminId = req.user.userId;
  const updatedLab = await userService.updateLabDetailsService(adminId, req.body);
  res.json(new ApiResponse(200, updatedLab, "Lab details updated successfully"));
});