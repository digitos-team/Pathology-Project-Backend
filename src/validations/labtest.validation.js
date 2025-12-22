// src/validations/test.validation.js

import Joi from "joi";

// shared fields
const referenceRange = Joi.object({
  min: Joi.number().required(),
  max: Joi.number().greater(Joi.ref("min")).required(),
});

const unitEnum = [
  "mg/dL",
  "g/dL",
  "µIU/mL",
  "mIU/L",
  "cells/µL",
  "lakhs/µL",
  "mmol/L",
  "ng/mL",
  "%",
];

const categoryEnum = [
  "Blood",
  "Urine",
  "Biochemistry",
  "Hormone",
  "Immunology",
  "Microbiology",
  "Other",
];

export const createTest = {
  body: Joi.object({
    testName: Joi.string().trim().min(2).required(),
    category: Joi.string()
      .valid(...categoryEnum)
      .required(),
    price: Joi.number().positive().required(),
    unit: Joi.string()
      .valid(...unitEnum)
      .required(),
    referenceRange: referenceRange.required(),
  }),
};

// PUT /api/tests/:id
export const updateTest = {
  body: Joi.object({
    testName: Joi.string().trim().min(2).optional(),
    category: Joi.string()
      .valid(...categoryEnum)
      .optional(),
    price: Joi.number().positive().optional(),
    unit: Joi.string()
      .valid(...unitEnum)
      .optional(),
    referenceRange: referenceRange.optional(),
    isActive: Joi.boolean().optional(),
  }),
};