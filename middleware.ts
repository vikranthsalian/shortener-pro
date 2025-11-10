import { type NextRequest, NextResponse } from "next/server"
import { validateToken } from "@/lib/api-token"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith("/api/") || pathname.startsWith("/api/auth/") || pathname.startsWith("/api/migrate")) {
    return NextResponse.next()
  }

  const authHeader = request.headers.get("authorization")

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7)

    try {
      const validToken = await validateToken(token)

      if (!validToken) {
        return NextResponse.json({ error: "Invalid or revoked API token" }, { status: 401 })
      }

      const response = NextResponse.next()
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set("x-user-id", validToken.user_id.toString())
      requestHeaders.set("x-user-email", validToken.user_email)
      requestHeaders.set("x-api-token", token)

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (error) {
      console.error("[v0] Token validation error:", error)
      return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/api/:path*",
}
