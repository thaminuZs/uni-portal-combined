export const libraryProxy = async (
  { request }: { request: Request },
  claims: { sub: string; email: string; role: string },
) => {
  const origin = process.env.LIBRARY_URL!;
  const url = new URL(request.url);

  const path = url.pathname.replace(/^\/api\/libraries/, "");
  const target = origin + path + url.search;

  const method = request.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);

  const headers = new Headers(request.headers);
  headers.delete("x-user-id");
  headers.delete("x-user-email");
  headers.delete("x-user-role");

  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("accept-encoding");
  headers.delete("postman-token");

  headers.set("x-user-id", claims.sub);
  headers.set("x-user-email", claims.email);
  headers.set("x-user-role", claims.role);

  const options: RequestInit = {
    method,
    headers,
    ...(hasBody ? { body: request.body } : {}),
  };

  return fetch(target, options);
};
