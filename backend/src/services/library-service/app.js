import express from "express";
import { dbConnection } from "./config/db.js";
import { libraryRoutes } from "./routes/library-route.js";
import { errorHandler } from "./middleware/error-middleware.js";
import { requireGatewayIdentity } from "./middleware/auth-identity.js";

if (process.env.NODE_ENV !== "production") {
  const dotenv = await import("dotenv");
  dotenv.config();
}
const PORT = process.env.PORT || 5003;

const app = express();
app.use(express.json());
app.use(requireGatewayIdentity);
app.use("/", libraryRoutes);
app.use(errorHandler);

dbConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`server is on ${PORT}`);
  });
});
