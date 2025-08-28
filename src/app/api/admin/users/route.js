import { NextResponse } from "next/server"
import { Client, Users, Query } from "node-appwrite"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get("page") || 1)
    const limit = Number(searchParams.get("limit") || 50)
    const offset = (page - 1) * limit

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY)

    const users = new Users(client)

    const res = await users.list([Query.limit(limit), Query.offset(offset)])

    const mapped = res.users.map((u) => {
      const prefs = u.prefs || {}
      return {
        key: u.$id,
        $id: u.$id,
        name: u.name || "No Name",
        email: u.email,
        phone: u.phone || "N/A",
        status: u.status ? "Active" : "Inactive",
        verification: u.emailVerification ? "Verified" : "Unverified",
        role: Array.isArray(u.labels) && u.labels.includes("admin") ? "Admin" : "User",
        labels: Array.isArray(u.labels) && u.labels.length ? u.labels.join(", ") : "None",
        lastActive: u.accessedAt || u.updatedAt || u.createdAt,
        joined: u.createdAt,
        department: prefs.department || "N/A",
        level: prefs.level || "N/A",
        matricNumber: prefs.matricNumber || "N/A",
        profileCompleted: prefs.profileCompleted ? "Yes" : "No",
      }
    })

    return NextResponse.json({
      users: mapped,
      total: res.total,
      page,
      limit,
    })
  } catch (error) {
    console.error("/api/admin/users GET error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
