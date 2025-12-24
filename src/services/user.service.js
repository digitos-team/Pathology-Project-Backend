// user.service.js
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import PathologyLab from '../models/pathologyLab.model.js';
import { ApiError } from '../utils/ApiError.js';

export const registerUserService = async ({ name, email, password, role, createdBy }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(400, 'User with this email already exists');

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    createdBy
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
};


export const updateUserService = async (userId, { name, email, password }) => {
  const updateData = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
  if (!user) throw new ApiError(404, 'User not found');

  return user;
};

export const createOrupdateLabDetailsService = async (adminId, updateData) => {
  const updateOps = { ...updateData, owner: adminId };

  const lab = await PathologyLab.findOneAndUpdate(
    {},
    updateOps,
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return lab;
};

export const deleteUserService = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user;
};
