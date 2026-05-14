import { Router } from "express";
import canteenController from "../controllers/canteen-controller.js";
import { allowRoles } from "../middleware/authorize.js";

const app = Router();

app
  .get("/", allowRoles("admin", "student", "dash"), canteenController.getAllCanteens)
  .get("/:id", allowRoles("admin", "student"), canteenController.getCanteenById)
  .post("/", allowRoles("admin"), canteenController.createCanteen)
  .patch(
    "/:id/menu",
    allowRoles("admin", "student"),
    canteenController.updateFoodMenu,
  )
  .post(
    "/:id/queue",
    allowRoles("admin", "student"),
    canteenController.reportQueueStatus,
  )
  .get(
    "/:id/queue/logs",
    allowRoles("admin", "student"),
    canteenController.getQueueLogs,
  );

export { app as canteenRoutes };
