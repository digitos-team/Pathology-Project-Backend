import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as userService from "../services/auth/user.service.js";
import { validateCreateReceptionistRequest } from "../validations/auth.validation.js";

export const createReceptionistController = asyncHandler(async (req, res) => {
  validateCreateReceptionistRequest(req.body);
  const createdBy = req.user.userId; // must be ADMIN
  const { name, email, password } = req.body;

  const user = await userService.createReceptionist({
    name,
    email,
    password,
    createdBy,
  });
  res
    .status(201)
    .json(new ApiResponse(201, user, "Receptionist created successfully"));
});
