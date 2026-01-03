import mongoose from "mongoose";

const billSchema = new mongoose.Schema({
    billNumber: {
        type: String,
        required: true,
        unique: true,
    },
    // invoiceId removed
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
        // required: true // Now optional
    },
    testOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TestOrder",
    },
    items: [
        {
            name: String,
            price: Number,
        },
    ],
    status: {
        type: String,
        enum: ["PENDING", "PAID", "CANCELLED"],
        default: "PENDING",
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    discountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Discount",
    },
    discountAmount: {
        type: Number,
        default: 0,
    },
    labId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PathologyLab",
        required: true,
    },
},
    {
        timestamps: true,
    }
);

import crypto from "crypto";

// Auto-generate bill number (Production Ready: No Race Conditions)
billSchema.pre("save", async function (next) {
    if (!this.billNumber) {
        const datePart = new Date().toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
        const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase(); // 4 random chars
        this.billNumber = `BILL-${datePart}-${randomPart}`;
    }
    next();
});

const Bill = mongoose.model("Bill", billSchema);
export default Bill;
