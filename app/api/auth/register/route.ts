import { type NextRequest, NextResponse } from "next/server"
import { runMigration } from "@/lib/migrate"
import { getUserByEmail, createUser } from "@/lib/auth"

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

    // Create new user
    const newUser = await createUser(email, password)

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
