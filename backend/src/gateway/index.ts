import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { lecturerProxy } from "./routes/lecturer-proxy";
import { canteenProxy } from "./routes/canteen-proxy";
import { libraryProxy } from "./routes/library-proxy";
import { authProxy } from "./routes/auth-proxy";
import { dashProxy } from "./routes/dash-proxy";
import { validateJwtFromRequest } from "./middleware/jwt-auth";
import { AppError } from "./utils/app-error";

if (process.env.NODE_ENV !== "production") {
  const dotenv = await import("dotenv");
  dotenv.config();
}
const PORT = Number(process.env.PORT) || 5000;

const app = new Elysia().onError(({ error, set }) => {
  if (error instanceof AppError) {
    set.status = error.statusCode;
    return error.message;
  }
  return "internal gateway error";
});

app
  .use(cors())

  .onRequest(({ request, set }) => {
    (set as any).start = Date.now();
  })
  .onAfterHandle(({ request, set }) => {
    const time = Date.now() - (set as any).start;
    const path = new URL(request.url).pathname;

    console.log(`${request.method} ${path} ${set.status} ${time}ms`);
  })

  .get("/", () => "gateway")

  .all("/api/auth*", (ctx) => authProxy(ctx), { parse: "none" })

  .all(
    "/api/lecturers*",
    async (ctx) => {
      const claims = validateJwtFromRequest(ctx.request);
      return lecturerProxy(ctx, claims);
    },
    { parse: "none" },
  )

  .all(
    "/api/canteens*",
    async (ctx) => {
      const claims = validateJwtFromRequest(ctx.request);
      return canteenProxy(ctx, claims);
    },
    { parse: "none" },
  )

  .all(
    "/api/libraries*",
    async (ctx) => {
      const claims = validateJwtFromRequest(ctx.request);
      return libraryProxy(ctx, claims);
    },
    { parse: "none" },
  )

  .all(
    "/api/dashboard*",
    async (ctx) => {
      return dashProxy(ctx);
    },
    { parse: "none" },
  );

app.listen(PORT, () => {
  console.log(`uni portal gateway is running on ${PORT}`);
});
