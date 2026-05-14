import { Schema, model } from "mongoose";

const queueLogSchema = new Schema({
    canteenId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Canteen"
    },
    level: {
        type: String,
        enum: ["low", "mid", "high"],
        default: "low",
        required: true
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

export const QueueLog = model("QueueLog", queueLogSchema);