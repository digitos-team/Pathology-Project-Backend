import mongoose from "mongoose";
import dotenv from "dotenv";
import Patient from "./src/models/patient.model.js";
import TestOrder from "./src/models/testorder.model.js";
import PathologyLab from "./src/models/pathologyLab.model.js";
import * as testReportService from "./src/services/testReport.service.js";
import LabTest from "./src/models/labtest.model.js";

dotenv.config();

const verifyConsolidation = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/Pathology_Lab";
        await mongoose.connect(mongoURI);
        console.log("Connected to MongoDB");

        // 1. Setup Data
        const lab = await PathologyLab.findOne() || await PathologyLab.create({ labName: "Verify Lab", owner: new mongoose.Types.ObjectId() });
        const labId = lab._id;

        const patient = await Patient.create({
            fullName: "Verify Consolidation",
            age: 40,
            gender: "Male",
            labId,
            createdBy: lab.owner
        });

        const labTest = await LabTest.create({
            labId,
            testName: "Consolidation Test",
            category: "Blood",
            price: 100,
            parameters: [{ name: "P1", unit: "u", referenceRanges: [{ gender: "Male", min: 0, max: 10 }] }]
        });

        const Doctor = (await import("./src/models/doctor.model.js")).default;
        const doctor = await Doctor.create({
            name: "Dr. Consolidation",
            mobile: "0000000000",
            lab: labId
        });

        // 2. Create Order
        console.log("Creating Test Order...");
        const { testOrder } = await testReportService.createTestOrder({
            patientId: patient._id,
            testIds: [labTest._id],
            doctorId: doctor._id,
            labId
        });

        // 3. Submit Results
        console.log("Submitting Results...");
        await testReportService.submitTestResults(testOrder._id, testOrder.tests[0]._id, {
            results: [{ parameterName: "P1", value: "5" }]
        });

        // 4. Finalize
        console.log("Finalizing Order...");
        await testReportService.finalizeTestOrder(testOrder._id);

        // 5. Verifications
        console.log("\n--- Verifying ---");

        // Ensure no TestReport documents were created (model missing anyway, but let's check via generic collection if possible, though model removal is the main proof)
        try {
            const testReportCollection = mongoose.connection.collection("testreports");
            const count = await testReportCollection.countDocuments();
            console.log(`TestReport collection document count: ${count} (Should be 0 if cleaned up)`);
        } catch (e) {
            console.log("TestReport collection check failed (expected if model is gone and collection dropped)");
        }

        // Check TestOrder status
        const finalizedOrder = await TestOrder.findById(testOrder._id);
        console.log("Finalized Order Status:", finalizedOrder.overallStatus); // Should be COMPLETED

        // Check Patient History
        const history = await testReportService.getPatientTestHistory(patient._id, labId);
        console.log("History Orders Count (Active):", history.orders.length); // Should be 0
        console.log("History Reports Count (Completed):", history.reports.length); // Should be 1

        const passed = finalizedOrder.overallStatus === "COMPLETED" && history.reports.length === 1;

        if (passed) {
            console.log("\n✅ CONSOLIDATION VERIFICATION PASSED!");
        } else {
            console.log("\n❌ CONSOLIDATION VERIFICATION FAILED!");
        }

        // Cleanup
        await Patient.findByIdAndDelete(patient._id);
        await LabTest.findByIdAndDelete(labTest._id);
        await Doctor.findByIdAndDelete(doctor._id);
        await TestOrder.findByIdAndDelete(testOrder._id);
        const Bill = (await import("./src/models/bill.model.js")).default;
        await Bill.findByIdAndDelete(finalizedOrder.billId);

        await mongoose.disconnect();
    } catch (error) {
        console.error("Verification failed!");
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        if (error.errors) console.error("Validation Errors:", JSON.stringify(error.errors, null, 2));
        console.error("Stack Trace:", error.stack);
        process.exit(1);
    }
};

verifyConsolidation();
