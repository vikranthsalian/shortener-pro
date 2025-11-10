import { db } from "@/lib/firebase"
import { initializeApp, cert, getApps, deleteApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

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

    const userAppName = `user-firebase-${linkData.userId}`

    // Check if app already exists and delete it to avoid conflicts
    const existingApps = getApps()
    const existingApp = existingApps.find((app) => app.name === userAppName)
    if (existingApp) {
      await deleteApp(existingApp)
    }

    // Initialize user's Firebase app
    const userApp = initializeApp(
      {
        credential: cert({
          projectId: credentials.projectId,
          clientEmail: credentials.clientEmail,
          privateKey: credentials.privateKey.replace(/\\n/g, "\n"),
        }),
      },
      userAppName,
    )

    const userDb = getFirestore(userApp)

    const linkDocument = {
      id: linkData.id,
      userId: linkData.userId,
      shortCode: linkData.shortCode,
      originalUrl: linkData.originalUrl,
      title: linkData.title || "",
      description: linkData.description || "",
      createdAt: new Date(linkData.createdAt),
      expiryDate: linkData.expiryDate || null,
      clicks: 0,
      impressions: 0,
      isActive: true,
    }

    const docRef = await userDb.collection("urls").add(linkDocument)

    console.log("[v0] Link successfully synced to user's Firebase with ID:", docRef.id)

    // Clean up the temporary app instance
    await deleteApp(userApp)

    return { synced: true, firebaseDocId: docRef.id }
  } catch (error) {
    console.error("[v0] Error syncing link to user Firebase:", error)
    return { synced: false, reason: "exception", error: String(error) }
  }
}
