import lecturerService from "../services/lecturer-service.js";

export default {
  createLecturer: async (req, res, next) => {
    try {
      const lecturer = await lecturerService.create(req.body);

      res.status(200).json({
        success: true,
        data: lecturer,
      });
    } catch (err) {
      next(err);
    }
  },

  getAllLecturers: async (req, res, next) => {
    try {
      const lecturers = await lecturerService.getAll();

      res.status(200).json({
        success: true,
        data: lecturers,
      });
    } catch (err) {
      next(err);
    }
  },

  getLecturerById: async (req, res, next) => {
    try {
      const id = req.params.id;

      const lecturer = await lecturerService.getById(id);

      res.status(200).json({
        success: true,
        data: lecturer,
      });
    } catch (err) {
      next(err);
    }
  },

  updateLecturer: async (req, res, next) => {
    try {
      const id = req.params.id;

      const updatedLecturer = await lecturerService.update(id, req.body);

      res.status(200).json({
        success: true,
        data: updatedLecturer,
      });
    } catch (err) {
      next(err);
    }
  },

  deleteLecturer: async (req, res, next) => {
    try {
      const id = req.params.id;
      const deletedLecturer = await lecturerService.delete(id);

      res.status(200).json({
        success: true,
        data: deletedLecturer,
      });
    } catch (err) {
      next(err);
    }
  },

  markLecturerAttendance: async (req, res, next) => {
    try {
      const id = req.params.id;
      const record = await lecturerService.markAttendance(id, req.body.status);

      res.status(200).json({
        success: true,
        data: record,
      });
    } catch (err) {
      next(err);
    }
  },

  getAllLogs: async (req, res, next) => {
    try {
      const id = req.params.id;
      const logs = await lecturerService.getLogs(id);

      res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (err) {
      next(err);
    }
  },
};
