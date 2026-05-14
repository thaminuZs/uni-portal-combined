import { Schema, model } from "mongoose";

const canteenSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    menu: {
        type: [String],
        default: []
    },
    currentQueue: {
        type: String,
        enum: ["low", "mid", "high"],
        default: "low"
    },
    updatedAt: {
        type: Date
    }
});

export const Canteen = model("Canteen", canteenSchema);