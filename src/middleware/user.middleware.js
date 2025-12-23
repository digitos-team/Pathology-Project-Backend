import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authMiddleware = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken || // cookie support
    req.headers.authorization?.split(" ")[1]; // header support

  if (!token) {
    throw new ApiError(401, "Access token is missing");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("[AUTH] Decoded token:", decoded);

    req.user = decoded; // REQUIRED
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }
});


// Optional Auth Middleware - Does not throw error if no token
export const optionalAuthMiddleware = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token invalid/expired - We ignore it and treat as unauthenticated
      // You could optionally log this
    }
  }
  next();
});

export const adminMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    throw new ApiError(403, "Only admins can perform this action");
  }
  next();
});
