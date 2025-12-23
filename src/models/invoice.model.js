import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
    {
        invoiceNumber: {
            type: String,
            required: true,
            unique: true,
        },
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true,
        },
        testReports: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "TestReport",
            },
        ],
        items: [
            {
                testName: String,
                price: Number,
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["PENDING", "PAID", "CANCELLED"],
            default: "PENDING",
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

// Auto-generate invoice number
invoiceSchema.pre("save", async function (next) {
    if (!this.invoiceNumber) {
        const count = await mongoose.model("Invoice").countDocuments();
        this.invoiceNumber = `INV-${Date.now()}-${count + 1}`;
    }
    next();
});

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;
