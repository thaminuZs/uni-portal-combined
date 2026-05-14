import { Router } from "express";
import { register, login } from "../controllers/auth-controller.js";

const app = Router();

app.post("/register", register).post("/login", login);

export { app as authRoutes };
