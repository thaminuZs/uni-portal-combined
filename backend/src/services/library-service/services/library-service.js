import { Library } from "../models/library-model.js";
import { OccupancyLog } from "../models/occupancyLog-model.js";
import { AppError } from "../utils/app-error.js";

export default {
  create: async (data) => {
    const exist = await Library.findOne({ name: data.name });
    if (exist) throw new AppError(400, "library with this name already exists");

    const createdLibrary = await Library.create(data);

    return createdLibrary;
  },

  getAll: async () => {
    const libraries = await Library.find();

    return libraries;
  },

  getById: async (id) => {
    const library = await Library.findById(id);
    if (!library) throw new AppError(404, "can't find a library with this id");

    return library;
  },

  setOccupancy: async (id, occupancy) => {
    const library = await Library.findById(id);
    if (!library) throw new AppError(404, "can't find a library with this id");

    const slot = new Date();
    const slotHour = Math.floor(slot.getHours() / 2) * 2;
    slot.setHours(slotHour, 0, 0, 0);

    const percentage = occupancy / library.capacity;
    let status = "";
    if (percentage === 0) {
      status = "empty";
    } else if (percentage <= 0.85) {
      status = "moderate";
    } else {
      status = "full";
    }
    const now = new Date();
    await Library.findByIdAndUpdate(id, {
      currentOccupancy: occupancy,
      status,
      updatedAt: now,
    });

    let record = await OccupancyLog.findOne({ libraryId: id, slot });

    if (record) {
      record.occupancy = occupancy;
      record.timeStamp = now;

      await record.save();
      return record;
    }

    record = await OccupancyLog.create({
      libraryId: id,
      occupancy,
      slot,
      timeStamp: now,
    });

    return record;
  },

  getLogs: async (id) => {
    const logs = await OccupancyLog.find({ libraryId: id });

    return logs;
  },
};
