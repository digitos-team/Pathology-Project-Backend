import bcrypt from 'bcryptjs';
import User from '../../models/pathologyUser/user.model.js';
import { ApiError } from '../../utils/ApiError.js';

export const createAdmin = async ({ name, email, password }) => {
    const existing = await User.findOne({ role: 'ADMIN' });
    if (existing) throw new ApiError(400, 'Admin already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN'
    });

    return {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
    };
};

export const updateAdmin = async (adminId, { name, email, password }) => {
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) {
        updateData.password = await bcrypt.hash(password, 10);
    }

    const admin = await User.findByIdAndUpdate(adminId, updateData, { new: true }).select('-password');
    if (!admin) throw new ApiError(404, 'Admin not found');

    return admin;
};
