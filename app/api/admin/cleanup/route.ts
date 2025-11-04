import { type NextRequest, NextResponse } from "next/server"
import { cleanupExpiredLinks } from "@/lib/cleanup-expired-links"

export async function POST(request: NextRequest) {
  try {
    const result = await cleanupExpiredLinks()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error during cleanup:", error)
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 })
  }
}
