import { runMigration } from "@/lib/migrate"

export async function GET() {
  try {
    await runMigration()
    return Response.json({
      success: true,
      message: "Database migrated successfully",
    })
  } catch (error) {
    console.error("Migration error:", error)
    return Response.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 },
    )
  }
}
