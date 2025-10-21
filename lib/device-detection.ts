export interface DeviceInfo {
  deviceType: string
  deviceBrand: string
  osName: string
  osVersion: string
  browserName: string
  browserVersion: string
}

export interface LocationInfo {
  country: string
  city: string
}

export function parseUserAgent(userAgent: string): DeviceInfo {
  const ua = userAgent.toLowerCase()

  // Detect device type
  let deviceType = "desktop"
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    deviceType = "mobile"
  } else if (/ipad|android|tablet/i.test(ua)) {
    deviceType = "tablet"
  }

  // Detect device brand
  let deviceBrand = "unknown"
  if (/iphone|ipad|ipod|mac/i.test(ua)) deviceBrand = "Apple"
  else if (/samsung/i.test(ua)) deviceBrand = "Samsung"
  else if (/huawei/i.test(ua)) deviceBrand = "Huawei"
  else if (/xiaomi/i.test(ua)) deviceBrand = "Xiaomi"
  else if (/oppo/i.test(ua)) deviceBrand = "Oppo"
  else if (/vivo/i.test(ua)) deviceBrand = "Vivo"
  else if (/nokia/i.test(ua)) deviceBrand = "Nokia"
  else if (/sony/i.test(ua)) deviceBrand = "Sony"

  // Detect OS
  let osName = "unknown"
  let osVersion = "unknown"
  if (/windows/i.test(ua)) {
    osName = "Windows"
    const match = ua.match(/windows nt ([\d.]+)/)
    if (match) osVersion = match[1]
  } else if (/mac/i.test(ua)) {
    osName = "macOS"
    const match = ua.match(/mac os x ([\d_]+)/)
    if (match) osVersion = match[1].replace(/_/g, ".")
  } else if (/android/i.test(ua)) {
    osName = "Android"
    const match = ua.match(/android ([\d.]+)/)
    if (match) osVersion = match[1]
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    osName = "iOS"
    const match = ua.match(/os ([\d_]+)/)
    if (match) osVersion = match[1].replace(/_/g, ".")
  } else if (/linux/i.test(ua)) {
    osName = "Linux"
  }

  // Detect browser
  let browserName = "unknown"
  let browserVersion = "unknown"
  if (/edg/i.test(ua)) {
    browserName = "Edge"
    const match = ua.match(/edg\/([\d.]+)/)
    if (match) browserVersion = match[1]
  } else if (/chrome/i.test(ua) && !/edg/i.test(ua)) {
    browserName = "Chrome"
    const match = ua.match(/chrome\/([\d.]+)/)
    if (match) browserVersion = match[1]
  } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
    browserName = "Safari"
    const match = ua.match(/version\/([\d.]+)/)
    if (match) browserVersion = match[1]
  } else if (/firefox/i.test(ua)) {
    browserName = "Firefox"
    const match = ua.match(/firefox\/([\d.]+)/)
    if (match) browserVersion = match[1]
  } else if (/trident/i.test(ua)) {
    browserName = "Internet Explorer"
    const match = ua.match(/rv:([\d.]+)/)
    if (match) browserVersion = match[1]
  }

  return {
    deviceType,
    deviceBrand,
    osName,
    osVersion,
    browserName,
    browserVersion,
  }
}

export async function getLocationFromIP(ip: string): Promise<LocationInfo> {
  if (ip === "unknown" || ip === "::1" || ip === "127.0.0.1") {
    console.log("[v0] Local IP detected, returning unknown location")
    return { country: "unknown", city: "unknown" }
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      console.log("[v0] IP API returned status:", response.status)
      throw new Error(`Failed to fetch location: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] IP API response:", data)

    return {
      country: data.country_code || data.country || "unknown",
      city: data.city || "unknown",
    }
  } catch (error) {
    console.error("[v0] Error fetching location from IP:", error)
    return { country: "unknown", city: "unknown" }
  }
}
