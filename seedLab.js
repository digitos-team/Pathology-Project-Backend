// seedLab.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import PathologyLab from "./src/models/pathologyLab.model.js";
import User from "./src/models/user.model.js";
import { app } from "./src/app.js"; // Import just to potentially trigger connection if needed, though we'll connect manually

dotenv.config({ path: './.env' });

const seedLab = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // REPLACE THIS WITH YOUR ADMIN EMAIL
        const adminEmail = "admin@pathology.com"; // Default or ask user

        // Checks if lab already exists
        const existingLab = await PathologyLab.findOne();
        if (existingLab) {
            console.log("Lab already exists:", existingLab.labName);
            process.exit(0);
        }

        // Find Admin User
        // If you don't know the email, we can just pick the first ADMIN
        const adminUser = await User.findOne({ role: 'ADMIN' });

        if (!adminUser) {
            console.error("No Admin user found! Please register an admin first via API.");
            process.exit(1);
        }

        console.log("Found Admin:", adminUser.email);

        const newLab = await PathologyLab.create({
            labName: "City Pathology Lab",
            owner: adminUser._id,
            address: "123 Health St, Wellness City",
            contact: "9876543210",
            licenseNumber: "LIC-2023-001"
        });

        console.log("-----------------------------------");
        console.log("✅ Lab Created Successfully!");
        console.log("Lab Name:", newLab.labName);
        console.log("Owner ID:", newLab.owner);
        console.log("-----------------------------------");
        console.log("👉 Now LOGIN AGAIN to get a token with labId.");

    } catch (error) {
        console.error("Error seeding lab:", error);
    } finally {
        await mongoose.disconnect();
    }
};

seedLab();
