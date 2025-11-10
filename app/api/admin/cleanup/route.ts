import { type NextRequest, NextResponse } from "next/server"
import { cleanupExpiredLinks, notifyExpiringLinks } from "@/lib/cleanup-expired-links"

export async function POST(request: NextRequest) {
  try {
    const notifyResult = await notifyExpiringLinks()
    const cleanupResult = await cleanupExpiredLinks()

    return NextResponse.json({
      cleanup: cleanupResult,
      notifications: notifyResult,
    })
  } catch (error) {
    console.error("Error during cleanup:", error)
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const notifyResult = await notifyExpiringLinks()
    const cleanupResult = await cleanupExpiredLinks()

    return NextResponse.json({
      cleanup: cleanupResult,
      notifications: notifyResult,
    })
  } catch (error) {
    console.error("Error during cleanup:", error)
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 })
  }
}
