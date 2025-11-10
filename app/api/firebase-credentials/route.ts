import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"

export async function POST(request: Request) {
  try {
    const { userId, projectId, clientEmail, privateKey, verified } = await request.json()

    if (!userId || !projectId || !clientEmail || !privateKey) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    if (!verified) {
      return NextResponse.json(
        { success: false, error: "Please verify Firebase credentials before saving" },
        { status: 400 },
      )
    }

    console.log("[v0] Saving Firebase credentials for user:", userId)

    const existingCredentials = await db
      .collection("user_firebase_credentials")
      .where("projectId", "==", projectId.trim())
      .limit(1)
      .get()

    if (!existingCredentials.empty) {
      console.log("[v0] Duplicate Firebase project ID detected during save:", projectId)
      return NextResponse.json(
        {
          success: false,
          error: "This Firebase project has already been registered",
        },
        { status: 409 },
      )
    }

    // Save encrypted credentials to user's Firebase document
    const userDocRef = db.collection("user_firebase_credentials").doc(userId.toString())

    await userDocRef.set({
      userId,
      projectId: projectId.trim(),
      clientEmail: clientEmail.trim(),
      privateKey: privateKey.trim(), // In production, encrypt this
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    console.log("[v0] Firebase credentials saved successfully")

    return NextResponse.json({
      success: true,
      message: "Firebase credentials saved successfully",
    })
  } catch (error) {
    console.error("[v0] Error saving Firebase credentials:", error)
    return NextResponse.json({ success: false, error: "Failed to save credentials" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID required" }, { status: 400 })
    }

    console.log("[v0] Fetching Firebase credentials for user:", userId)

    const userDocRef = db.collection("user_firebase_credentials").doc(userId)
    const doc = await userDocRef.get()

    if (!doc.exists) {
      return NextResponse.json({
        success: true,
        hasCredentials: false,
      })
    }

    const data = doc.data()

    return NextResponse.json({
      success: true,
      hasCredentials: true,
      credentials: {
        projectId: data?.projectId,
        clientEmail: data?.clientEmail,
        verified: data?.verified,
        createdAt: data?.createdAt,
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching Firebase credentials:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch credentials" }, { status: 500 })
  }
}
