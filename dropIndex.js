import mongoose from "mongoose";

const dropIndex = async () => {
  try {
    // Hardcoded based on error message "Pathology_Lab.patients" and typical localhost port
    const uri = "mongodb://localhost:27017/Pathology_Lab";
    console.log("Connecting to:", uri);
    
    await mongoose.connect(uri);
    console.log("Connected to DB");

    const collection = mongoose.connection.collection("patients");
    
    // Check if index exists
    const indexes = await collection.indexes();
    console.log("Current Indexes:", indexes);

    const phoneIndex = indexes.find(idx => idx.name === "phone_1");

    if (phoneIndex) {
      await collection.dropIndex("phone_1");
      console.log("Successfully dropped index: phone_1");
    } else {
      console.log("Index phone_1 not found.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

dropIndex();
