import { Schema, model } from "mongoose";

const attendanceLogSchema = new Schema({
    lecturerId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Lecturer"
    },
    date: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ["present", "absent"],
        default: "absent",
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    }
});

export const AttendanceLog = model("AttendanceLog", attendanceLogSchema);