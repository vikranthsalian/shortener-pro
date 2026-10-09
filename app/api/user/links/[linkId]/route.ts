import { NextResponse } from "next/server"
import { runMigration } from "@/lib/migrate"
import { sql } from "@/lib/db"

export async function DELETE(request: Request, { params }: { params: Promise<{ linkId: string }> }) {
  try {
  await runMigration()
  const { linkId: linkIdParam } = await params
  const linkId = Number.parseInt(linkIdParam)

    await sql`DELETE FROM urls WHERE id = ${linkId}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting link:", error)
    return NextResponse.json({ error: "Failed to delete link" }, { status: 500 })
  }
}
