import { AppError } from "../utils/app-error";

export const dashProxy = async ({ request }: { request: Request }) => {
  const origin = process.env.DASH_URL!;
  const url = new URL(request.url);

  const path = url.pathname.replace(/^\/api\/dashboard/, "");
  const target = origin + path + url.search;

  const method = request.method.toUpperCase();

  if (method === "GET") {
    const headers = new Headers(request.headers);
    headers.delete("x-user-id");
    headers.delete("x-user-email");
    headers.delete("x-user-role");
    headers.delete("host");
    headers.delete("connection");
    headers.delete("content-length");
    headers.delete("accept-encoding");
    headers.delete("postman-token");

    const options: RequestInit = {
      method,
      headers,
    };

    return fetch(target, options);
  } else {
    throw new AppError("invalid request", 401);
  }
};
