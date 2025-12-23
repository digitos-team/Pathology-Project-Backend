import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        category: {
            type: String,
            required: true,
            enum: ['COMMISSION', 'RENT', 'UTILITY', 'INVENTORY', 'SALARY', 'OTHER'],
            default: 'OTHER'
        },
        description: {
            type: String,
            trim: true
        },
        date: {
            type: Date,
            default: Date.now
        },

        // Link to the Lab
        lab: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PathologyLab",
            required: true
        },

        // Optional: Link to Doctor if this is a commission expense
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: false
        }
    },
    { timestamps: true }
);

export default mongoose.model("Expense", expenseSchema);
