import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PathologyLab",
      required: true,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
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

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for Test Orders (as testHistory for clarity)
patientSchema.virtual("testHistory", {
  ref: "TestOrder",
  localField: "_id",
  foreignField: "patientId"
});

// Virtual for Test Orders
patientSchema.virtual("testOrders", {
  ref: "TestOrder",
  localField: "_id",
  foreignField: "patientId"
});

export default mongoose.model("Patient", patientSchema);
