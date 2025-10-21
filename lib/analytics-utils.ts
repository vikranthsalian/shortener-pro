import { sql } from "./db"

export async function getHourlyStats(urlId: number, days = 7) {
  const result = await sql`
    SELECT 
      EXTRACT(HOUR FROM clicked_at) as hour,
      COUNT(*) as clicks
    FROM clicks
    WHERE url_id = ${urlId} AND clicked_at >= NOW() - MAKE_INTERVAL(days => ${days})
    GROUP BY EXTRACT(HOUR FROM clicked_at)
    ORDER BY hour
  `
  return result.map((row: any) => ({
    hour: Number(row.hour),
    clicks: Number(row.clicks),
  }))
}

export async function getDeviceStats(urlId: number) {
  const result = await sql`
    SELECT 
      device_type,
      COUNT(*) as count
    FROM clicks
    WHERE url_id = ${urlId}
    GROUP BY device_type
    ORDER BY count DESC
  `
  return result.map((row: any) => ({
    name: row.device_type || "unknown",
    value: Number(row.count),
  }))
}

export async function getBrowserStats(urlId: number) {
  const result = await sql`
    SELECT 
      browser_name,
      COUNT(*) as count
    FROM clicks
    WHERE url_id = ${urlId}
    GROUP BY browser_name
    ORDER BY count DESC
    LIMIT 10
  `
  return result.map((row: any) => ({
    name: row.browser_name || "unknown",
    value: Number(row.count),
  }))
}

export async function getOSStats(urlId: number) {
  const result = await sql`
    SELECT 
      os_name,
      COUNT(*) as count
    FROM clicks
    WHERE url_id = ${urlId}
    GROUP BY os_name
    ORDER BY count DESC
  `
  return result.map((row: any) => ({
    name: row.os_name || "unknown",
    value: Number(row.count),
  }))
}

export async function getLocationStats(urlId: number) {
  const result = await sql`
    SELECT 
      country,
      city,
      COUNT(*) as clicks
    FROM clicks
    WHERE url_id = ${urlId} AND country != 'unknown'
    GROUP BY country, city
    ORDER BY clicks DESC
    LIMIT 20
  `
  return result.map((row: any) => ({
    country: row.country || "unknown",
    city: row.city || "unknown",
    clicks: Number(row.clicks),
  }))
}
