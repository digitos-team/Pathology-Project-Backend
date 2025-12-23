import mongoose from "mongoose";

const testReportSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },

    testType: {
      type: String,
      required: true,
      index: true,
    },

    testDate: {
      type: Date,
      required: true,
      index: true,
    },

    reportData: {
      type: Object, // flexible for different tests
      required: true,
    },

    reportFileUrl: {
      type: String, // PDF / image
    },

    doctorName: {
      type: String,
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
