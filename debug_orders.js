import fs from "fs";
import mongoose from "mongoose";
import TestOrder from "./src/models/testorder.model.js";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect("mongodb://localhost:27017/Pathology_Lab");
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const debugOrders = async () => {
    await connectDB();

    try {
        const orders = await TestOrder.find({});
        console.log(`Total orders in DB: ${orders.length}`);

        // Test the EXACT query used in service
        const specificQuery = await TestOrder.find({
            overallStatus: { $in: ["PENDING", "PARTIAL"] },
            isHistorical: { $ne: true }
        });
        console.log(`Matches for specific query (isHistorical: { $ne: true }): ${specificQuery.length}`);

        // Test query assuming missing field
        const missingFieldQuery = await TestOrder.find({
            overallStatus: { $in: ["PENDING", "PARTIAL"] },
            isHistorical: { $ne: true }
        });
        console.log(`Matches for query (isHistorical != true): ${missingFieldQuery.length}`);

        // Check unique LabIDs
        const labIds = [...new Set(orders.map(o => o.labId.toString()))];
        console.log("Unique LabIDs found:", labIds);

        const pending = orders.filter(o => o.overallStatus === "PENDING" || o.overallStatus === "PARTIAL");

        let output = "";
        output += `Total orders in DB: ${orders.length}\n`;
        output += `Matches for specific query (isHistorical: false): ${specificQuery.length}\n`;
        output += `Matches for loose query (isHistorical != true): ${missingFieldQuery.length}\n`;
        output += `Unique LabIDs found: ${labIds.join(", ")}\n`;

        if (pending.length > 0) {
            output += `\n--- Found ${pending.length} Pending/Partial Orders ---\n`;
            pending.forEach(order => {
                output += `ID: ${order._id}\n`;
                output += `LabID: ${order.labId}\n`;
                output += `Status: ${order.overallStatus}\n`;
                output += `Historical: ${order.isHistorical}\n`;
                output += `Is FALSE? ${order.isHistorical === false}\n`;
                output += "-----------------------\n";
            });
        } else {
            output += "\nNo PENDING or PARTIAL orders found.\n";
        }

        fs.writeFileSync("debug_output.txt", output);
        console.log("Output written to debug_output.txt");
    } catch (error) {
        console.error("Error fetching orders:", error);
    } finally {
        await mongoose.disconnect();
    }
};

debugOrders();
