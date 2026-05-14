import express from "express";
import { dbConnection } from "./config/db.js";
import { authRoutes } from "./routes/auth-routes.js";
import { errorHandler } from "./middleware/error-middleware.js";

if (process.env.NODE_ENV !== "production") {
  const dotenv = await import("dotenv");
  dotenv.config();
}

const PORT = process.env.PORT || 5004;

const app = express();
app.use(express.json());
app.use("/", authRoutes);
app.use(errorHandler);

dbConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`server is on ${PORT}`);
  });
});
