import mongoose from "mongoose";

const referenceRangeSchema = new mongoose.Schema(
  {
    min: {
      type: Number,
      required: true,
    },
    max: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const testSchema = new mongoose.Schema(
  {
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lab",
      required: true,
    },

    testName: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Blood",
        "Urine",
        "Biochemistry",
        "Hormone",
        "Immunology",
        "Microbiology",
        "Other",
      ],
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      required: true,
      enum: [
        "mg/dL",
        "g/dL",
        "µIU/mL",
        "mIU/L",
        "cells/µL",
        "lakhs/µL",
        "mmol/L",
        "ng/mL",
        "%",
      ],
    },

    referenceRange: {
      type: referenceRangeSchema,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Test = mongoose.model("Test", testSchema);
export default Test;