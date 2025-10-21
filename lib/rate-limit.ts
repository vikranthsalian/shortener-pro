import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_KV_KV_REST_API_URL || "",
  token: process.env.UPSTASH_KV_KV_REST_API_TOKEN || "",
})

export async function rateLimit(key: string, limit = 10, windowMs = 60000) {
  const current = await redis.incr(key)

  if (current === 1) {
    await redis.expire(key, Math.ceil(windowMs / 1000))
  }

  return {
    current,
    limit,
    remaining: Math.max(0, limit - current),
    reset: await redis.ttl(key),
    isLimited: current > limit,
  }
}
