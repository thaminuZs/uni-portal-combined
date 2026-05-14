import { Schema, model } from "mongoose";

const lecturerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    department: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ["present", "absent"],
        default: "absent"
    },
    lastSeen: {
        type: Date
    }
});

export const Lecturer = model("Lecturer", lecturerSchema); 