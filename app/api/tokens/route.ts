import { type NextRequest, NextResponse } from "next/server"
import { createAPIToken, getUserAPITokens } from "@/lib/api-token"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log("[v0] GET /api/tokens - userId:", userId)

    const tokens = await getUserAPITokens(Number.parseInt(userId))

    console.log("[v0] Returning", tokens.length, "tokens")
    return NextResponse.json({ tokens })
  } catch (error) {
    console.error("[v0] Error in GET /api/tokens:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch tokens"
    const errorDetails = error instanceof Error ? error.stack : String(error)
    console.error("[v0] Error details:", errorDetails)

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userEmail, tokenName } = body

    if (!userId || !userEmail || !tokenName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const token = await createAPIToken(userId, userEmail, tokenName)

    return NextResponse.json({ token }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating API token:", error)
    return NextResponse.json({ error: "Failed to create token" }, { status: 500 })
  }
}
