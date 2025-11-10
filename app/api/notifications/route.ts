import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const notifications = await sql`
      SELECT n.id, n.type, n.message, n.is_read, n.created_at, n.url_id,
             u.short_code, u.title
      FROM notifications n
      LEFT JOIN urls u ON n.url_id = u.id
      WHERE n.user_id = ${userId}
      ORDER BY n.created_at DESC
      LIMIT 50
    `

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    const { notificationId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await sql`
      UPDATE notifications
      SET is_read = true
      WHERE id = ${notificationId}
      AND user_id = ${userId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}
