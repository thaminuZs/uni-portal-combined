import { Schema, model } from "mongoose";

const librarySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    capacity: {
        type: Number,
        required: true
    },
    currentOccupancy: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["empty", "moderate", "full"],
        default: "empty"
    },
    updatedAt: {
        type: Date
    }
});

export const Library = model("Library", librarySchema);

