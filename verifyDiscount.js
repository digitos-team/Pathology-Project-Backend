import mongoose from "mongoose";
import dotenv from "dotenv";
import Bill from "./src/models/bill.model.js";
import Discount from "./src/models/discount.model.js";
import Payment from "./src/models/payment.model.js";
import Revenue from "./src/models/revenue.model.js";
import * as paymentService from "./src/services/payment.service.js";
import PathologyLab from "./src/models/pathologyLab.model.js";

dotenv.config();

const testDiscount = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/Pathology_Lab";
        console.log("Connecting to:", mongoURI);
        await mongoose.connect(mongoURI);
        console.log("Connected to MongoDB");

        // 1. Setup Data
        const lab = await PathologyLab.findOne() || await PathologyLab.create({ labName: "Test Lab", owner: new mongoose.Types.ObjectId() });
        const labId = lab._id;

        // 2. Create Discount
        const discount = await Discount.create({
            name: "Test 10% Off",
            type: "PERCENT",
            value: 10,
            labId: labId,
            isActive: true
        });
        console.log("Discount created:", discount._id);

        // 3. Create Bill
        const bill = await Bill.create({
            billNumber: `TEST-BILL-${Date.now()}`,
            patientId: new mongoose.Types.ObjectId(),
            totalAmount: 1000,
            labId: labId,
            status: "PENDING"
        });
        console.log("Bill created:", bill._id);

        // 4. Record Payment with Discount
        console.log("Recording payment with discount...");
        const result = await paymentService.recordPayment({
            billId: bill._id,
            amount: 900, // Frontend would send 900
            paymentMethod: "CASH",
            labId: labId,
            discountId: discount._id
        });

        // 5. Verify Results
        const updatedBill = await Bill.findById(bill._id);
        const revenue = await Revenue.findOne({ billId: bill._id });

        console.log("Verification results:");
        console.log("- Bill status:", updatedBill.status); // Expected: PAID
        console.log("- Bill discountAmount:", updatedBill.discountAmount); // Expected: 100
        console.log("- Revenue totalAmount:", revenue.totalAmount); // Expected: 900

        if (updatedBill.status === "PAID" && updatedBill.discountAmount === 100 && revenue.totalAmount === 900) {
            console.log("✅ Verification PASSED!");
        } else {
            console.log("❌ Verification FAILED!");
        }

        // Cleanup
        await Discount.findByIdAndDelete(discount._id);
        await Bill.findByIdAndDelete(bill._id);
        await Payment.findByIdAndDelete(result.payment._id);
        await Revenue.findByIdAndDelete(result.revenue._id);

        await mongoose.disconnect();
    } catch (error) {
        console.error("Test failed:", error);
        process.exit(1);
    }
};

testDiscount();
