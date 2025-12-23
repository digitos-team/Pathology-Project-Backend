import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PathologyLab",
      required: true,
      index: true
    },

    fullName: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String
    },

    age: {
      type: Number,
      required: true,
      min: 0,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },

    // Medical Records (linked references)
    testHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TestReport",
      },
    ],

    // Soft delete
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

export default mongoose.model("Patient", patientSchema);
