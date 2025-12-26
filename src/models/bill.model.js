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
    testReports: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TestReport",
        },
    ],
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

// Auto-generate bill number
billSchema.pre("save", async function (next) {
    if (!this.billNumber) {
        const count = await mongoose.model("Bill").countDocuments();
        this.billNumber = `BILL-${Date.now()}-${count + 1}`;
    }
    next();
});

const Bill = mongoose.model("Bill", billSchema);
export default Bill;
