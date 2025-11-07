import { type NextRequest, NextResponse } from "next/server"
import { runMigration } from "@/lib/migrate"
import { getOrCreateGoogleUser, getUserByGoogleId, getUserByEmail } from "@/lib/auth"
import { createFirebaseUser } from "@/lib/firebase-user"

export async function POST(request: NextRequest) {
  try {
    await runMigration()

    const { googleId, email, name, image } = await request.json()

    // Validate input
    if (!googleId || !email) {
      return NextResponse.json({ error: "Google ID and email are required" }, { status: 400 })
    }

    const existingGoogleUser = await getUserByGoogleId(googleId)
    const existingEmailUser = await getUserByEmail(email)
    const isNewUser = !existingGoogleUser && !existingEmailUser

    // Get or create user
    const user = await getOrCreateGoogleUser(googleId, email, name, image)

    if (isNewUser) {
      try {
        await createFirebaseUser(user.id, user.email)
        console.log("[v0] Firebase user document created for new Google user:", user.id)
      } catch (firebaseError) {
        console.error("[v0] Failed to create Firebase user document:", firebaseError)
        // Don't fail authentication if Firebase fails, but log the error
      }
    }

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
