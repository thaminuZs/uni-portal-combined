import { Router } from "express";
import lecturerController from "../controllers/lecturer-controller.js";
import { allowRoles } from "../middleware/authorize.js";

const app = Router();

app
  .get("/", allowRoles("admin", "student", "dash"), lecturerController.getAllLecturers)
  .get(
    "/:id",
    allowRoles("admin", "student"),
    lecturerController.getLecturerById,
  )
  .post("/", allowRoles("admin"), lecturerController.createLecturer)
  .put("/:id", allowRoles("admin"), lecturerController.updateLecturer)
  .delete("/:id", allowRoles("admin"), lecturerController.deleteLecturer)
  .post(
    "/:id/attendance",
    allowRoles("admin"),
    lecturerController.markLecturerAttendance,
  )
  .get(
    "/:id/attendance",
    allowRoles("admin", "student"),
    lecturerController.getAllLogs,
  );

export { app as lecturerRoutes };
