import canteenService from "../services/canteen-service.js";

export default {
  createCanteen: async (req, res, next) => {
    try {
      const canteen = await canteenService.create(req.body);

      res.status(200).json({
        success: true,
        data: canteen,
      });
    } catch (err) {
      next(err);
    }
  },

  getAllCanteens: async (req, res, next) => {
    try {
      const canteens = await canteenService.getAll();

      res.status(200).json({
        success: true,
        data: canteens,
      });
    } catch (err) {
      next(err);
    }
  },

  getCanteenById: async (req, res, next) => {
    try {
      const id = req.params.id;

      const canteen = await canteenService.getById(id);

      res.status(200).json({
        success: true,
        data: canteen,
      });
    } catch (err) {
      next(err);
    }
  },

  updateFoodMenu: async (req, res, next) => {
    try {
      const id = req.params.id;

      const canteen = await canteenService.updateMenu(id, req.body.menu);

      res.status(200).json({
        success: true,
        data: canteen,
      });
    } catch (err) {
      next(err);
    }
  },

  reportQueueStatus: async (req, res, next) => {
    try {
      const id = req.params.id;
      const record = await canteenService.reportQueue(id, req.body.level);

      res.status(200).json({
        success: true,
        data: record,
      });
    } catch (err) {
      next(err);
    }
  },

  getQueueLogs: async (req, res, next) => {
    try {
      const id = req.params.id;
      const logs = await canteenService.getLogs(id);

      res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (err) {
      next(err);
    }
  },
};
