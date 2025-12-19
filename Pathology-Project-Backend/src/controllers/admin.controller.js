import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as adminService from "../services/auth/admin.service.js";
import { validateCreateAdminRequest } from "../validations/auth.validation.js";

export const createAdminController = asyncHandler(async (req, res) => {
  validateCreateAdminRequest(req.body);
  const { name, email, password } = req.body;
  const admin = await adminService.createAdmin({ name, email, password });
  res
    .status(201)
    .json(new ApiResponse(201, admin, "Admin created successfully"));
});

export const updateAdminController = asyncHandler(async (req, res) => {
  const adminId = req.user.userId;
  const updated = await adminService.updateAdmin(adminId, req.body);
  res.json(new ApiResponse(200, updated, "Admin profile updated"));
});
