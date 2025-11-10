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
    console.log("[v0] POST /api/tokens - Starting token creation")
    const body = await request.json()
    console.log("[v0] Request body:", JSON.stringify(body))

    const { userId, userEmail, tokenName } = body

    if (!userId || !userEmail || !tokenName) {
      console.log("[v0] Missing required fields:", { userId, userEmail, tokenName })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] Creating token for user:", userId, "email:", userEmail, "name:", tokenName)
    const token = await createAPIToken(userId, userEmail, tokenName)
    console.log("[v0] Token created successfully:", token.token)

    return NextResponse.json({ token }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating API token:", error)
    if (error instanceof Error) {
      console.error("[v0] Error name:", error.name)
      console.error("[v0] Error message:", error.message)
      console.error("[v0] Error stack:", error.stack)
    }
    const errorMessage = error instanceof Error ? error.message : "Failed to create token"
    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.stack : String(error) },
      { status: 500 },
    )
  }
}
