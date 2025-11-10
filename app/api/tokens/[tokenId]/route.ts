import { type NextRequest, NextResponse } from "next/server"
import { revokeToken } from "@/lib/api-token"

export async function DELETE(req: NextRequest, { params }: { params: { tokenId: string } }) {
  try {
    const userId = req.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tokenId = Number.parseInt(params.tokenId)
    const success = await revokeToken(tokenId, Number.parseInt(userId))

    if (!success) {
      return NextResponse.json({ error: "Token not found or already revoked" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error revoking token:", error)
    return NextResponse.json({ error: "Failed to revoke token" }, { status: 500 })
  }
}
