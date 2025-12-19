import bcrypt from 'bcryptjs';
import User from '../../models/pathologyUser/user.model.js';
import { ApiError } from '../../utils/ApiError.js';

export const createReceptionist = async ({ name, email, password, createdBy }) => {
    const existing = await User.findOne({ email });
    if (existing) throw new ApiError(400, 'User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'RECEPTIONIST',
        createdBy
    });

    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
    };
};