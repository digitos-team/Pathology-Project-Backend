import mongoose from "mongoose";
const labSchema = new mongoose.Schema(
  {
    labName: { type: String, required: true },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    address: String,
    contact: String,

    licenseNumber: String,
    gstNumber: String,
    panNumber: String,
  },
  { timestamps: true }
);

export default mongoose.model("PathologyLab", labSchema);
