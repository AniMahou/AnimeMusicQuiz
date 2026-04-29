// middleware.js

export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/lobby/:path*",
    "/api/lobby/:path*",
    "/api/game/:path*",
  ]
}