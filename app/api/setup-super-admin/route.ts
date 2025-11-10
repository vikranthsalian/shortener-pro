import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST() {
  try {
    const sql = neon(process.env.NEON_DATABASE_URL!)

    // Add is_super_admin column if it doesn't exist
    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'is_super_admin'
        ) THEN
          ALTER TABLE users ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE;
        END IF;
      END $$;
    `

    // Create super admin user with empty password (to be set later)
    await sql`
      INSERT INTO users (email, password_hash, name, provider, created_at, updated_at, is_super_admin)
      VALUES ('super@admin.com', '', 'Super Admin', 'email', NOW(), NOW(), TRUE)
      ON CONFLICT (email) DO UPDATE SET is_super_admin = TRUE
    `

    // Verify the super admin was created
    const result = await sql`
      SELECT id, email, name, is_super_admin 
      FROM users 
      WHERE email = 'super@admin.com'
    `

    if (result.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Super admin user created successfully",
        user: result[0],
      })
    } else {
      return NextResponse.json({ success: false, message: "Failed to verify super admin creation" }, { status: 500 })
    }
  } catch (error: any) {
    console.error("[v0] Error setting up super admin:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Failed to setup super admin" },
      { status: 500 },
    )
  }
}
