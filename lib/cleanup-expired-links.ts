import { sql } from "./db"

/**
 * Cleanup expired links from the database
 * Should be called periodically (e.g., via a cron job)
 */
export async function cleanupExpiredLinks() {
  try {
    console.log("[v0] Starting cleanup of expired links...")

    // Delete expired links
    const result = await sql`
      DELETE FROM urls 
      WHERE expiry_date IS NOT NULL 
      AND expiry_date < NOW()
      AND is_active = true
    `

    console.log(`[v0] Cleanup completed. Removed ${result.length} expired links`)
    return { success: true, removedCount: result.length }
  } catch (error) {
    console.error("[v0] Error during cleanup of expired links:", error)
    throw error
  }
}
