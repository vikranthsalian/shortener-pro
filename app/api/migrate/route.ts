import { NextResponse } from "next/server"
import { runMigration } from "@/lib/migrate"

export async function GET() {
  try {
    await runMigration()
    return NextResponse.json({
      success: true,
      message: "Database migrated successfully",
    })
  } catch (error) {
    console.error("Migration error:", error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 },
    )
  }
}
