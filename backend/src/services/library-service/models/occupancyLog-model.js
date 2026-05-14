import { Schema, model } from "mongoose";

const occupancyLogSchema = new Schema({
    libraryId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Library"
    },
    occupancy: {
        type: Number,
        required: true,
        default: 0,
    },
    slot: {
        type: Date,
        required: true
    },
    timeStamp: {
        type: Date,
        required: true
    }
});

export const OccupancyLog = model("OccupancyLog", occupancyLogSchema);