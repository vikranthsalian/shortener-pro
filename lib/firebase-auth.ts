// Helper to get Firebase access token from service account credentials
export async function getAccessToken(clientEmail: string, privateKey: string, projectId: string): Promise<string> {
  try {
    // Create JWT for Firebase authentication
    const now = Math.floor(Date.now() / 1000)
    const header = {
      alg: "RS256",
      typ: "JWT",
    }

    const payload = {
      iss: clientEmail,
      sub: clientEmail,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
      scope: "https://www.googleapis.com/auth/datastore",
    }

    // Use Web Crypto API for signing (works in Edge runtime)
    const encoder = new TextEncoder()
    const headerB64 = btoa(JSON.stringify(header)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
    const payloadB64 = btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")

    const message = `${headerB64}.${payloadB64}`

    // Import the private key
    const privateKeyPem = privateKey.replace(/\\n/g, "\n")
    const pemHeader = "-----BEGIN PRIVATE KEY-----"
    const pemFooter = "-----END PRIVATE KEY-----"
    const pemContents = privateKeyPem.substring(pemHeader.length, privateKeyPem.lastIndexOf(pemFooter)).trim()

    // Convert base64 to ArrayBuffer
    const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0))

    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      binaryKey,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
      },
      false,
      ["sign"],
    )

    // Sign the JWT
    const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, encoder.encode(message))

    const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "")

    const jwt = `${message}.${signatureB64}`

    // Exchange JWT for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    })

    if (!tokenResponse.ok) {
      throw new Error(`Failed to get access token: ${await tokenResponse.text()}`)
    }

    const tokenData = await tokenResponse.json()
    return tokenData.access_token
  } catch (error) {
    console.error("[v0] Error getting Firebase access token:", error)
    throw error
  }
}
