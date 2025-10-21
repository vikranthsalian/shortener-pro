import { type NextRequest, NextResponse } from "next/server"
import { runMigration } from "@/lib/migrate"
import { getOrCreateGoogleUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    await runMigration()

    const { googleId, email, name, image } = await request.json()

    // Validate input
    if (!googleId || !email) {
      return NextResponse.json({ error: "Google ID and email are required" }, { status: 400 })
    }

    // Get or create user
    const user = await getOrCreateGoogleUser(googleId, email, name, image)

    return NextResponse.json(
      {
        message: "Google authentication successful",
        user,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Google auth error:", error)
    return NextResponse.json({ error: "Google authentication failed" }, { status: 500 })
  }
}
