import { type NextRequest, NextResponse } from "next/server"
import { runMigration } from "@/lib/migrate"
import { getUserByEmail, createUser } from "@/lib/auth"
import { createFirebaseUser } from "@/lib/firebase-user"

export async function POST(request: NextRequest) {
  try {
    await runMigration()

    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        {
          message: "User already exists",
          user: existingUser,
        },
        { status: 200 },
      )
    }

    // Create new user in database
    console.log("[v0] Creating new user in database...")
    const newUser = await createUser(email, password)
    console.log("[v0] User created successfully in database:", newUser.id)

    try {

      await createFirebaseUser(newUser.id, newUser.email)
    } catch (firebaseError) {
      // Firebase creation is optional, log but don't fail registration
      console.log("[v0] Firebase user creation skipped or failed (non-critical)")
    }

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: newUser,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
