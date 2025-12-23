import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  parameterName: { type: String, required: true },
  value: { type: String }, // Can be number or string value
  unit: { type: String },
  referenceRange: {
    min: Number,
    max: Number
  }
}, { _id: false });

const testReportSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },

    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LabTest",
      // required: true // Made optional for purely external reports
    },

    testName: {
      type: String,
      required: true,
    },

    testDate: {
      type: Date,
      required: true,
      default: Date.now
    },

    status: {
      type: String,
      enum: ["PENDING", "COMPLETED"],
      default: "PENDING",
      index: true
    },

    results: [resultSchema],

    reportFileUrl: {
      type: String,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },

    // For external reports where doctor isn't in our DB
    doctorName: {
      type: String
    },

    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PathologyLab",
      required: true
    },

    // Auto-expiry after 1 year (optional TTL index)
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      index: { expires: "0s" },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("TestReport", testReportSchema);
