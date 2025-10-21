import { runMigration } from "@/lib/migrate"
import { sql } from "@/lib/db"

export async function DELETE(request: Request, { params }: { params: { linkId: string } }) {
  try {
    await runMigration()

    const linkId = Number.parseInt(params.linkId)

    await sql`DELETE FROM urls WHERE id = ${linkId}`

    return Response.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting link:", error)
    return Response.json({ error: "Failed to delete link" }, { status: 500 })
  }
}
