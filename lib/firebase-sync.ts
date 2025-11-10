import { db } from "@/lib/firebase"

export async function syncLinkToUserFirebase(linkData: {
  id: number
  userId: string
  shortCode: string
  originalUrl: string
  title?: string | null
  description?: string | null
  createdAt: string
  expiryDate?: string | null
}) {
  try {
    console.log("[v0] Checking if user has Firebase credentials for sync:", linkData.userId)

    // Fetch user's Firebase credentials from our Firestore
    const userDocRef = db.collection("user_firebase_credentials").doc(linkData.userId)
    const doc = await userDocRef.get()

    if (!doc.exists) {
      console.log("[v0] User has no Firebase credentials configured, skipping sync")
      return { synced: false, reason: "no_credentials" }
    }

    const credentials = doc.data()
    if (!credentials?.projectId || !credentials?.privateKey || !credentials?.clientEmail) {
      console.log("[v0] Incomplete Firebase credentials, skipping sync")
      return { synced: false, reason: "incomplete_credentials" }
    }

    console.log("[v0] Syncing link to user's Firebase:", credentials.projectId)

    // Use Firebase REST API to write to user's Firestore
    const firebaseProjectId = credentials.projectId
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents/urls`

    // Get access token using service account credentials
    const { getAccessToken } = await import("./firebase-auth")
    const accessToken = await getAccessToken(credentials.clientEmail, credentials.privateKey, firebaseProjectId)

    // Prepare link document
    const linkDocument = {
      fields: {
        id: { integerValue: linkData.id.toString() },
        userId: { stringValue: linkData.userId },
        shortCode: { stringValue: linkData.shortCode },
        originalUrl: { stringValue: linkData.originalUrl },
        title: { stringValue: linkData.title || "" },
        description: { stringValue: linkData.description || "" },
        createdAt: { timestampValue: new Date(linkData.createdAt).toISOString() },
        expiryDate: { stringValue: linkData.expiryDate || "" },
        clicks: { integerValue: "0" },
        impressions: { integerValue: "0" },
        isActive: { booleanValue: true },
      },
    }

    // POST to user's Firestore
    const response = await fetch(firestoreUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(linkDocument),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Failed to sync link to user Firebase:", errorText)
      return { synced: false, reason: "firebase_error", error: errorText }
    }

    const result = await response.json()
    console.log("[v0] Link successfully synced to user's Firebase:", result.name)

    return { synced: true, firebaseDocId: result.name }
  } catch (error) {
    console.error("[v0] Error syncing link to user Firebase:", error)
    return { synced: false, reason: "exception", error: String(error) }
  }
}
