import { db } from "@/lib/firebase"
import { initializeApp, cert, getApps, deleteApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

export async function hasFirebaseCredentials(userId: string): Promise<boolean> {
  try {
    if (!userId || userId === "") {
      return false
    }

    const userDocRef = db.collection("user_firebase_credentials").doc(userId.toString())
    const doc = await userDocRef.get()

    if (!doc.exists) {
      return false
    }

    const credentials = doc.data()
    return !!(credentials?.projectId && credentials?.privateKey && credentials?.clientEmail)
  } catch (error) {
    console.error("[v0] Error checking Firebase credentials:", error)
    return false
  }
}

export async function getUserFirebaseDb(userId: string) {
  try {
    const userDocRef = db.collection("user_firebase_credentials").doc(userId.toString())
    const doc = await userDocRef.get()

    if (!doc.exists) {
      throw new Error("No Firebase credentials found")
    }

    const credentials = doc.data()
    if (!credentials?.projectId || !credentials?.privateKey || !credentials?.clientEmail) {
      throw new Error("Incomplete Firebase credentials")
    }

    const userAppName = `user-firebase-${userId}-${Date.now()}`

    const existingApps = getApps()
    const existingApp = existingApps.find((app) => app.name === userAppName)
    if (existingApp) {
      await deleteApp(existingApp)
    }

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

    return { userDb, userApp, projectId: credentials.projectId }
  } catch (error) {
    console.error("[v0] Error getting user Firebase DB:", error)
    throw error
  }
}

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
    if (!linkData.userId || linkData.userId === "") {
      console.log("[v0] Invalid userId, skipping Firebase sync")
      return { synced: false, reason: "invalid_user_id" }
    }

    console.log("[v0] Checking if user has Firebase credentials for sync:", linkData.userId)

    const hasCredentials = await hasFirebaseCredentials(linkData.userId)
    if (!hasCredentials) {
      console.log("[v0] User has no Firebase credentials configured, skipping sync")
      return { synced: false, reason: "no_credentials" }
    }

    const { userDb, userApp } = await getUserFirebaseDb(linkData.userId)

    const linkDocument = {
      id: linkData.id,
      userId: linkData.userId,
      shortCode: linkData.shortCode,
      originalUrl: linkData.originalUrl,
      title: linkData.title || "",
      description: linkData.description || "",
      createdAt: new Date(linkData.createdAt),
      expiryDate: linkData.expiryDate ? new Date(linkData.expiryDate) : null,
      clicks: 0,
      impressions: 0,
      isActive: true,
    }

    console.log("[v0] Writing link document to collection 'urls'")
    const docRef = await userDb.collection("urls").add(linkDocument)

    console.log("[v0] Link successfully synced to user's Firebase with ID:", docRef.id)

    await deleteApp(userApp)

    return { synced: true, firebaseDocId: docRef.id }
  } catch (error) {
    console.error("[v0] Error syncing link to user Firebase:", error)
    if (error instanceof Error) {
      console.error("[v0] Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      })
    }
    return { synced: false, reason: "exception", error: String(error) }
  }
}

export async function getLinkFromFirebase(userId: string, shortCode: string) {
  try {
    const { userDb, userApp } = await getUserFirebaseDb(userId)

    const snapshot = await userDb
      .collection("urls")
      .where("shortCode", "==", shortCode)
      .where("isActive", "==", true)
      .limit(1)
      .get()

    if (snapshot.empty) {
      await deleteApp(userApp)
      return null
    }

    const doc = snapshot.docs[0]
    const data = doc.data()

    await deleteApp(userApp)

    return {
      id: data.id,
      originalUrl: data.originalUrl,
      shortCode: data.shortCode,
      expiryDate: data.expiryDate?.toDate() || null,
      firebaseDocId: doc.id,
      userId: data.userId,
    }
  } catch (error) {
    console.error("[v0] Error getting link from Firebase:", error)
    return null
  }
}

export async function recordClickInFirebase(
  userId: string,
  shortCode: string,
  clickData: {
    userAgent: string
    referrer: string
    ipAddress: string
    country: string
    city: string
    deviceType: string
    deviceBrand: string
    osName: string
    osVersion: string
    browserName: string
    browserVersion: string
  },
) {
  try {
    const { userDb, userApp } = await getUserFirebaseDb(userId)

    await userDb.collection("clicks").add({
      shortCode,
      userId,
      ...clickData,
      clickedAt: new Date(),
    })

    // Increment click count on the URL document
    const urlSnapshot = await userDb.collection("urls").where("shortCode", "==", shortCode).limit(1).get()

    if (!urlSnapshot.empty) {
      const urlDoc = urlSnapshot.docs[0]
      await urlDoc.ref.update({
        clicks: (urlDoc.data().clicks || 0) + 1,
      })
    }

    await deleteApp(userApp)
    console.log("[v0] Click recorded in user's Firebase")
  } catch (error) {
    console.error("[v0] Error recording click in Firebase:", error)
  }
}

export async function findLinkInAnyFirebase(shortCode: string) {
  try {
    // Get all users with Firebase credentials
    const credentialsSnapshot = await db.collection("user_firebase_credentials").get()

    if (credentialsSnapshot.empty) {
      console.log("[v0] No Firebase credentials found in system")
      return null
    }

    // Try each user's Firebase database
    for (const credDoc of credentialsSnapshot.docs) {
      const userId = credDoc.id
      console.log("[v0] Checking Firebase for user:", userId)

      try {
        const link = await getLinkFromFirebase(userId, shortCode)
        if (link) {
          console.log("[v0] Link found in Firebase for user:", userId)
          return { ...link, userId }
        }
      } catch (error) {
        console.error(`[v0] Error checking Firebase for user ${userId}:`, error)
        // Continue to next user
      }
    }

    console.log("[v0] Link not found in any Firebase database")
    return null
  } catch (error) {
    console.error("[v0] Error finding link in Firebase:", error)
    return null
  }
}
