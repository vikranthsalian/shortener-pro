import { type NextRequest, NextResponse } from "next/server"
import { createAPIToken, getUserAPITokens } from "@/lib/api-token"

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tokens = await getUserAPITokens(Number.parseInt(userId))

    return NextResponse.json({ tokens })
  } catch (error) {
    console.error("[v0] Error fetching tokens:", error)
    return NextResponse.json({ error: "Failed to fetch tokens" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  console.log("[v0] POST /api/tokens - Request received")

  try {
    const userId = req.headers.get("x-user-id")
    const userEmail = req.headers.get("x-user-email")

    console.log("[v0] Headers:", { userId, userEmail })

    if (!userId || !userEmail) {
      console.log("[v0] Missing userId or userEmail headers")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    console.log("[v0] Request body:", body)

    const { name, rateLimit } = body

    if (!name) {
      console.log("[v0] Missing token name")
      return NextResponse.json({ error: "Token name is required" }, { status: 400 })
    }

    console.log("[v0] Calling createAPIToken...")
    const token = await createAPIToken(Number.parseInt(userId), userEmail, name, rateLimit || 1000)

    console.log("[v0] Token created successfully:", token.id)
    return NextResponse.json({ token }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating token:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      {
        error: "Failed to create token",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
