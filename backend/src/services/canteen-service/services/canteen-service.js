import { Canteen } from "../models/canteen-model.js";
import { QueueLog } from "../models/queueLog-model.js";
import { AppError } from "../utils/app-error.js";

export default {
  create: async (data) => {
    const exist = await Canteen.findOne({ name: data.name });
    if (exist) throw new AppError(400, "canteen with this name already exists");

    const createdCanteen = await Canteen.create(data);

    return createdCanteen;
  },

  getAll: async () => {
    const canteens = await Canteen.find();

    return canteens;
  },

  getById: async (id) => {
    const canteen = await Canteen.findById(id);
    if (!canteen) throw new AppError(404, "can't find a canteen with this id");

    return canteen;
  },

  updateMenu: async (id, menu) => {
    const canteen = await Canteen.findById(id);
    if (!canteen) throw new AppError(404, "can't find a canteen with this id");

    const updatedCanteen = await Canteen.findByIdAndUpdate(
      id,
      { menu },
      { new: true },
    );

    return updatedCanteen;
  },

  reportQueue: async (id, level) => {
    const canteen = await Canteen.findById(id);
    if (!canteen) throw new AppError(404, "can't find a canteen with this id");

    const slot = new Date();
    const slotMinutes = slot.getMinutes() >= 30 ? 30 : 0;
    slot.setMinutes(slotMinutes, 0, 0);

    const now = new Date();
    await Canteen.findByIdAndUpdate(id, {
      currentQueue: level,
      updatedAt: now,
    });

    let record = await QueueLog.findOne({ canteenId: id, slot });

    if (record) {
      record.level = level;
      record.timeStamp = now;

      await record.save();
      return record;
    }

    record = await QueueLog.create({
      canteenId: id,
      level: level,
      slot,
      timeStamp: now,
    });

    return record;
  },

  getLogs: async (id) => {
    const logs = await QueueLog.find({ canteenId: id });

    return logs;
  },
};
