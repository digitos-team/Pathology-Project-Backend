// import mongoose from "mongoose";

// const patientSchema = new mongoose.Schema(
//   {
//     labId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "PathologyLab",
//       required: true,
//       index: true,
//     },

//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     fullName: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     phone: {
//       type: String,
//       trim: true,
//     },

//     age: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     gender: {
//       type: String,
//       enum: ["Male", "Female", "Other"],
//       required: true,
//     },

//     address: {
//       street: String,
//       city: String,
//       state: String,
//       pincode: String,
//     },

//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Patient", patientSchema);
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
      index: true, // Single field index
    },

    phone: {
      type: String,
      trim: true,
      index: true, // Single field index
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
      index: true, // Single field index
    },
    reportStatus: {
      type: String,
      enum: ["pending", "generated", "sent", "failed"],
      default: "pending"
    },
    reportPdfPath: {type:String},
    emailSentAt: {type:Date}
  },
  { timestamps: true }
);

// ============================================
// COMPOUND INDEXES FOR OPTIMIZATION
// ============================================

// Most important: labId + isActive + createdAt (Your main query)
patientSchema.index({ labId: 1, isActive: 1, createdAt: -1 });

// For sorting by different fields
patientSchema.index({ labId: 1, isActive: 1, fullName: 1 });

// For phone lookups within a lab
patientSchema.index({ labId: 1, phone: 1 });

// For gender-based filtering
patientSchema.index({ labId: 1, gender: 1, createdAt: -1 });

// Text index for full-text search (name and phone)
patientSchema.index({ fullName: "text", phone: "text" });

export default mongoose.model("Patient", patientSchema);
