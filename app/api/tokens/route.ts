import { type NextRequest, NextResponse } from "next/server"
console.log("[v0] tokens/route.ts - Importing firebase module...")
import { db } from "@/lib/firebase"
console.log("[v0] tokens/route.ts - Firebase db imported:", db ? "SUCCESS" : "FAILED")

console.log("[v0] tokens/route.ts - About to import api-token module...")
import { createAPIToken, getUserAPITokens } from "@/lib/api-token"
console.log("[v0] tokens/route.ts - api-token module imported successfully")

export async function GET(request: NextRequest) {
  console.log("[v0] GET /api/tokens endpoint called")

  console.log("[v0] Testing Firebase connection, db instance:", db ? "exists" : "null")

  try {
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      console.log("[v0] Missing userId parameter")
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log("[v0] GET /api/tokens - userId:", userId)

    try {
      console.log("[v0] About to call getUserAPITokens...")
      const tokens = await getUserAPITokens(Number.parseInt(userId))
      console.log("[v0] Successfully fetched", tokens.length, "tokens")
      return NextResponse.json({ tokens })
    } catch (dbError) {
      console.error("[v0] Database error in getUserAPITokens:", dbError)

      // Provide helpful error messages
      let errorMessage = "Failed to fetch tokens from Firebase"
      if (dbError instanceof Error) {
        console.error("[v0] Error message:", dbError.message)
        console.error("[v0] Error stack:", dbError.stack)

        if (dbError.message.includes("Missing Firebase credentials")) {
          errorMessage = "Firebase is not configured. Please add Firebase environment variables."
        } else {
          errorMessage = `Database error: ${dbError.message}`
        }
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[v0] Unexpected error in GET /api/tokens:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, firebaseAppId, tokenName,userEmail } = body

    if (!userId || !firebaseAppId || !tokenName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] POST /api/tokens - Creating token for user:", userId, "with Firebase App ID:", firebaseAppId)

    const token = await createAPIToken(userId, firebaseAppId, tokenName,userEmail)
    console.log("[v0] Token created successfully:", token.name)

    return NextResponse.json({ token }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating API token:", error)
    return NextResponse.json(
      {
        error: "Failed to create token",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
