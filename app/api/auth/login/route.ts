import { type NextRequest, NextResponse } from "next/server"
import { runMigration } from "@/lib/migrate"
import { authenticateUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    await runMigration()

    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Authenticate user
    const user = await authenticateUser(email, password)

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    return NextResponse.json(
      {
        message: "Login successful",
        user,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
