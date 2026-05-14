import { Router } from "express";
import libraryController from "../controllers/library-controller.js";
import { allowRoles } from "../middleware/authorize.js";

const app = Router();

app
  .get("/", allowRoles("admin", "student", "dash"), libraryController.getAllLibraries)
  .get("/:id", allowRoles("admin", "student"), libraryController.getLibraryById)
  .post("/", allowRoles("admin"), libraryController.createLibrary)
  .post(
    "/:id/occupancy",
    allowRoles("admin", "student"),
    libraryController.reportOccupancy,
  )
  .get(
    "/:id/occupancy/logs",
    allowRoles("admin", "student"),
    libraryController.getOccupancyLogs,
  );

export { app as libraryRoutes };
