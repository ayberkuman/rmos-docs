import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";

const neonMiddleware = auth.middleware({
  loginUrl: "/auth/sign-in",
});

export default async function middleware(request: NextRequest) {
  // WORKAROUND: The neon auth library uses the incoming request's method for internal session validation.
  // This causes POST requests to fail (POST /get-session -> 404).
  // We explicitly pass a GET request to the middleware to ensure validation succeeds.
  const requestForAuth = new NextRequest(request.url, {
    headers: request.headers,
    method: "GET", // Force GET for validation
  });

  const response = await neonMiddleware(requestForAuth);

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
