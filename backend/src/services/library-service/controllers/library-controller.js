import libraryService from "../services/library-service.js";

export default {
  createLibrary: async (req, res, next) => {
    try {
      const library = await libraryService.create(req.body);

      res.status(200).json({
        success: true,
        data: library,
      });
    } catch (err) {
      next(err);
    }
  },

  getAllLibraries: async (req, res, next) => {
    try {
      const libraries = await libraryService.getAll();

      res.status(200).json({
        success: true,
        data: libraries,
      });
    } catch (err) {
      next(err);
    }
  },

  getLibraryById: async (req, res, next) => {
    try {
      const id = req.params.id;

      const library = await libraryService.getById(id);

      res.status(200).json({
        success: true,
        data: library,
      });
    } catch (err) {
      next(err);
    }
  },

  reportOccupancy: async (req, res, next) => {
    try {
      const id = req.params.id;
      const record = await libraryService.setOccupancy(id, req.body.count);

      res.status(200).json({
        success: true,
        data: record,
      });
    } catch (err) {
      next(err);
    }
  },

  getOccupancyLogs: async (req, res, next) => {
    try {
      const id = req.params.id;
      const logs = await libraryService.getLogs(id);

      res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (err) {
      next(err);
    }
  },
};
