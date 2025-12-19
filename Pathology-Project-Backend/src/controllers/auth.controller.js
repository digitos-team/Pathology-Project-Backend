import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as authService from "../services/auth/auth.service.js";
import { validateLoginRequest } from "../validations/auth.validation.js";

export const loginController = asyncHandler(async (req, res) => {
  validateLoginRequest(req.body);
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);
  res.json(new ApiResponse(200, result, "Login successful"));
});
