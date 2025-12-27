import mongoose from "mongoose";
import dotenv from "dotenv";
import LabTest from "./src/models/labtest.model.js";
import Patient from "./src/models/patient.model.js";
import TestOrder from "./src/models/testorder.model.js";
import PathologyLab from "./src/models/pathologyLab.model.js";
import * as testReportService from "./src/services/testReport.service.js";

dotenv.config();

const testGenderRanges = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/Pathology_Lab";
        await mongoose.connect(mongoURI);
        console.log("Connected to MongoDB");

        // 1. Setup Lab
        const lab = await PathologyLab.findOne() || await PathologyLab.create({ labName: "Test Lab", owner: new mongoose.Types.ObjectId() });
        const labId = lab._id;

        // 2. Create Lab Test with Male and Female ranges
        const labTest = await LabTest.create({
            labId,
            testName: "Gender Test",
            category: "Blood",
            price: 500,
            parameters: [
                {
                    name: "Hemoglobin",
                    unit: "g/dL",
                    referenceRanges: [
                        { gender: "Male", min: 14, max: 18 },
                        { gender: "Female", min: 12, max: 16 }
                    ]
                }
            ]
        });
        console.log("Lab Test created");

        // 3. Create Doctor
        const Doctor = (await import("./src/models/doctor.model.js")).default;
        const doctor = await Doctor.create({
            name: "Dr. Testing",
            mobile: "1234567890",
            specialization: "General",
            lab: labId,
            commissionPercentage: 10
        });
        const doctorId = doctor._id;

        // 4. Create Male Patient & Order
        const malePatient = await Patient.create({
            fullName: "John Doe",
            age: 30,
            gender: "Male",
            labId,
            createdBy: lab.owner
        });

        console.log("Creating order for Male patient...");
        const maleOrderResult = await testReportService.createTestOrder({
            patientId: malePatient._id,
            testIds: [labTest._id],
            doctorId: doctorId,
            labId
        });

        const maleRange = maleOrderResult.testOrder.tests[0].results[0].referenceRange;
        console.log(`Male Range: ${maleRange.min} - ${maleRange.max}`);

        // 4. Create Female Patient & Order
        const femalePatient = await Patient.create({
            fullName: "Jane Doe",
            age: 28,
            gender: "Female",
            labId,
            createdBy: lab.owner
        });

        console.log("Creating order for Female patient...");
        const femaleOrderResult = await testReportService.createTestOrder({
            patientId: femalePatient._id,
            testIds: [labTest._id],
            doctorId: doctorId,
            labId
        });

        const femaleRange = femaleOrderResult.testOrder.tests[0].results[0].referenceRange;
        console.log(`Female Range: ${femaleRange.min} - ${femaleRange.max}`);

        // 5. Assertions
        const passed = maleRange.min === 14 && maleRange.max === 18 && femaleRange.min === 12 && femaleRange.max === 16;

        if (passed) {
            console.log("✅ Gender-Based Reference Range Verification PASSED!");
        } else {
            console.log("❌ Gender-Based Reference Range Verification FAILED!");
        }

        // Cleanup
        await LabTest.findByIdAndDelete(labTest._id);
        await Doctor.findByIdAndDelete(doctorId);
        await Patient.findByIdAndDelete(malePatient._id);
        await Patient.findByIdAndDelete(femalePatient._id);
        await TestOrder.findByIdAndDelete(maleOrderResult.testOrder._id);
        await TestOrder.findByIdAndDelete(femaleOrderResult.testOrder._id);
        // Delete bills too
        const Bill = (await import("./src/models/bill.model.js")).default;
        await Bill.findByIdAndDelete(maleOrderResult.bill._id);
        await Bill.findByIdAndDelete(femaleOrderResult.bill._id);

        await mongoose.disconnect();
    } catch (error) {
        console.error("Test failed:", JSON.stringify(error, null, 2));
        process.exit(1);
    }
};

testGenderRanges();
