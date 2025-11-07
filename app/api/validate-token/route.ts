import { type NextRequest, NextResponse } from "next/server"
import { validateAPIToken, logAPIUsage } from "@/lib/api-token"

export async function POST(request: NextRequest) {
  try {
    const { token, path, method } = await request.json()

    const validToken = await validateAPIToken(token)

    if (!validToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Log API usage
    await logAPIUsage(token, path, method, 200)

    return NextResponse.json({ valid: true, userId: validToken.userId })
  } catch (error) {
    console.error("[v0] Validation error:", error)
    return NextResponse.json({ error: "Validation failed" }, { status: 500 })
  }
}
