import { type NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Only apply to API routes that require authentication
  if (path.startsWith("/api/") && !isPublicAPIRoute(path)) {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 })
    }

    const token = authHeader.substring(7) // Remove "Bearer " prefix

    try {
      const response = await fetch(`${request.nextUrl.origin}/api/validate-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, path, method: request.method }),
      })

      if (!response.ok) {
        return NextResponse.json({ error: "Invalid or expired API token" }, { status: 401 })
      }
    } catch (error) {
      console.error("[v0] Token validation error:", error)
      return NextResponse.json({ error: "Token validation failed" }, { status: 500 })
    }

    // Continue with the request
    return NextResponse.next()
  }

  return NextResponse.next()
}

function isPublicAPIRoute(path: string): boolean {
  const publicRoutes = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/google",
    "/api/migrate",
    "/api/redirect/",
    "/api/impression/",
    "/api/validate-token",
    "/api/tokens",
    "/api/firebase-test",
    "/api/firebase-verify",
    "/api/firebase-credentials",
    "/api/shorten",
    "/api/user/links",
    "/api/analytics",
    "/api/super-admin/analytics",
    "/api/super-admin/firebase-credentials",
    "/api/setup-super-admin",
    "/api/super-admin/set-password",
  ]

  return publicRoutes.some((route) => path.startsWith(route))
}

export const config = {
  matcher: "/api/:path*",
}
