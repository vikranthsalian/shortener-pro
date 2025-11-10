import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 })
    }

    // Verify this is a super admin request
    const sql = neon(process.env.NEON_DATABASE_URL!)

    const users = await sql`
      SELECT id, is_super_admin 
      FROM users 
      WHERE email = ${email} AND is_super_admin = TRUE
    `

    if (users.length === 0) {
      return NextResponse.json({ success: false, message: "Super admin user not found" }, { status: 404 })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update the password
    await sql`
      UPDATE users 
      SET password_hash = ${hashedPassword}, updated_at = NOW()
      WHERE email = ${email}
    `

    return NextResponse.json({
      success: true,
      message: "Super admin password set successfully",
    })
  } catch (error: any) {
    console.error("[v0] Error setting super admin password:", error)
    return NextResponse.json({ success: false, message: error.message || "Failed to set password" }, { status: 500 })
  }
}
