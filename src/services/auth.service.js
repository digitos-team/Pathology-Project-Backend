import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Lab from "../models/pathologyLab.model.js";
import { ApiError } from "../utils/ApiError.js";

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new ApiError(401, "Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(401, "Invalid credentials");

  // User ke basis pe lab nikaalo
  const lab = await Lab.findOne({ owner: user._id });
  if (!lab) throw new ApiError(400, "Lab not assigned to this user");

  const token = jwt.sign(
    {
      userId: user._id,
      labId: lab._id,   
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { token, user, lab };
};

