// NEW MODEL: testOrder.model.js or visit.model.js
import mongoose from "mongoose";

const testItemSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LabTest",
    required: true
  },
  testName: String,
  price: Number,
  status: {
    type: String,
    enum: ["PENDING", "COMPLETED"],
    default: "PENDING"
  },
  results: [{
    parameterName: String,
    value: String,
    unit: String,
    referenceRange: {
      min: Number,
      max: Number
    }
  }],
  reportFileUrl: String
}, { _id: true }); // Keep _id for individual test tracking

const testOrderSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
    index: true
  },

  labId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PathologyLab",
    required: true
  },

  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    // Make optional to support external reports
  },

  doctorName: {
    type: String, // For external doctors
  },

  orderDate: {
    type: Date,
    required: true,
    default: Date.now
  },

  tests: [testItemSchema], // Array of tests in this order

  overallStatus: {
    type: String,
    enum: ["PENDING", "PARTIAL", "COMPLETED"],
    default: "PENDING"
  },

  isHistorical: {
    type: Boolean,
    default: false
  },

  totalAmount: {
    type: Number,
    required: true
  },

  billId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bill"
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export default mongoose.model("TestOrder", testOrderSchema);