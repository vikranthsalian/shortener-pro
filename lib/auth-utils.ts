import { sql } from "./db"

export async function getUserById(userId: string) {
  const result = await sql`SELECT id, email, name, image, created_at FROM users WHERE id = ${userId}`
  return result[0] || null
}

export async function getUserByEmail(email: string) {
  const result = await sql`SELECT id, email, name, image, created_at FROM users WHERE email = ${email}`
  return result[0] || null
}

export async function getUserLinks(userId: string) {
  const result = await sql`
    SELECT 
      u.id,
      u.short_code,
      u.original_url,
      u.title,
      u.description,
      u.created_at,
      COUNT(DISTINCT c.id) as total_clicks,
      COUNT(DISTINCT i.id) as total_impressions,
      COALESCE(SUM(CAST(a.estimated_earnings AS DECIMAL)), 0) as total_earnings
    FROM urls u
    LEFT JOIN clicks c ON u.id = c.url_id
    LEFT JOIN impressions i ON u.id = i.url_id
    LEFT JOIN analytics a ON u.id = a.url_id
    WHERE u.user_id = ${userId}
    GROUP BY u.id, u.short_code, u.original_url, u.title, u.description, u.created_at
    ORDER BY u.created_at DESC
  `
  return result
}

export async function getLinkAnalytics(linkId: string, userId: string) {
  const result = await sql`
    SELECT 
      u.id,
      u.short_code,
      u.original_url,
      u.title,
      COUNT(DISTINCT c.id) as total_clicks,
      COUNT(DISTINCT i.id) as total_impressions,
      COALESCE(SUM(CAST(a.estimated_earnings AS DECIMAL)), 0) as total_earnings,
      COALESCE(ROUND(100.0 * COUNT(DISTINCT i.id) / NULLIF(COUNT(DISTINCT c.id), 0), 2), 0) as ctr
    FROM urls u
    LEFT JOIN clicks c ON u.id = c.url_id
    LEFT JOIN impressions i ON u.id = i.url_id
    LEFT JOIN analytics a ON u.id = a.url_id
    WHERE u.id = ${linkId} AND u.user_id = ${userId}
    GROUP BY u.id, u.short_code, u.original_url, u.title
  `
  return result[0] || null
}
