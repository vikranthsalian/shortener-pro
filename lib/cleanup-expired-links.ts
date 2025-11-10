import { sql } from "./db"

/**
 * Cleanup expired links from the database
 * Deletes links that expired more than 7 days ago
 */
export async function cleanupExpiredLinks() {
  try {
    console.log("[v0] Starting cleanup of expired links...")

    const result = await sql`
      DELETE FROM urls 
      WHERE expiry_date IS NOT NULL 
      AND expiry_date < NOW() - INTERVAL '7 days'
      AND is_active = true
      RETURNING id, short_code, user_id
    `

    console.log(`[v0] Cleanup completed. Removed ${result.length} expired links`)
    return { success: true, removedCount: result.length, removedLinks: result }
  } catch (error) {
    console.error("[v0] Error during cleanup of expired links:", error)
    throw error
  }
}

/**
 * Send notifications to users about links expiring soon
 * Notifies users 3 days before expiry
 */
export async function notifyExpiringLinks() {
  try {
    console.log("[v0] Checking for links expiring soon...")

    const expiringLinks = await sql`
      SELECT u.id as url_id, u.short_code, u.title, u.expiry_date, u.user_id, us.email, us.name
      FROM urls u
      LEFT JOIN users us ON u.user_id::integer = us.id
      WHERE u.expiry_date IS NOT NULL
      AND u.expiry_date > NOW()
      AND u.expiry_date <= NOW() + INTERVAL '3 days'
      AND u.is_active = true
      AND u.user_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM notifications n
        WHERE n.url_id = u.id
        AND n.type = 'expiry_warning'
        AND n.created_at > NOW() - INTERVAL '4 days'
      )
    `

    const notifications = []
    for (const link of expiringLinks) {
      const daysUntilExpiry = Math.ceil((new Date(link.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

      const message = `Your link "${link.title || link.short_code}" will expire in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? "s" : ""}. It will be deleted 7 days after expiry.`

      await sql`
        INSERT INTO notifications (user_id, url_id, type, message)
        VALUES (${link.user_id}, ${link.url_id}, 'expiry_warning', ${message})
      `

      notifications.push({
        userId: link.user_id,
        urlId: link.url_id,
        email: link.email,
        message,
      })
    }

    console.log(`[v0] Created ${notifications.length} expiry notifications`)
    return { success: true, notificationCount: notifications.length, notifications }
  } catch (error) {
    console.error("[v0] Error notifying expiring links:", error)
    throw error
  }
}
