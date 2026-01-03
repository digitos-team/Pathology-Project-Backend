import Joi from "joi";

const genderEnum = ["Male", "Female", "Other"];

export const createPatient = {
    body: Joi.object({
        fullName: Joi.string().trim().min(2).required(),
        phone: Joi.string()
            .trim()
            .pattern(/^[0-9]{10}$/)
            .messages({ "string.pattern.base": "Phone number must be exactly 10 digits" })
            .required(),
        age: Joi.number().integer().min(0).max(120).required(),
        gender: Joi.string()
            .valid(...genderEnum)
            .required(),
        email: Joi.string().email().lowercase().optional(),
        address: Joi.object({
            street: Joi.string().trim().optional(),
            city: Joi.string().trim().optional(),
            state: Joi.string().trim().optional(),
            pincode: Joi.string().trim().optional(),
        }).optional(),
    }),
};

export const updatePatient = {
    body: Joi.object({
        fullName: Joi.string().trim().min(2).optional(),
        phone: Joi.string()
            .trim()
            .pattern(/^[0-9]{10}$/)
            .messages({ "string.pattern.base": "Phone number must be exactly 10 digits" })
            .optional(),
        age: Joi.number().integer().min(0).max(120).optional(),
        gender: Joi.string()
            .valid(...genderEnum)
            .optional(),
        email: Joi.string().email().lowercase().optional(),
        address: Joi.object({
            street: Joi.string().trim().optional(),
            city: Joi.string().trim().optional(),
            state: Joi.string().trim().optional(),
            pincode: Joi.string().trim().optional(),
        }).optional(),
        isActive: Joi.boolean().optional(),
    }),
};
