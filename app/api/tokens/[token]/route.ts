import { type NextRequest, NextResponse } from "next/server"
import { revokeAPIToken } from "@/lib/api-token"

export async function DELETE(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const { token } = await params
    const success = await revokeAPIToken(token)

    if (!success) {
      return NextResponse.json({ error: "Failed to revoke token" }, { status: 500 })
    }

    return NextResponse.json({ message: "Token revoked successfully" })
  } catch (error) {
    console.error("[v0] Error revoking token:", error)
    return NextResponse.json({ error: "Failed to revoke token" }, { status: 500 })
  }
}
