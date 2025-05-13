import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

// Create a SQL executor using the Neon serverless driver
const sql = neon(process.env.NEON_NEON_DATABASE_URL || "")

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Query the database using the Neon serverless driver
    const users = await sql`SELECT * FROM "User" WHERE email = ${email} LIMIT 1`

    if (!users || users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(users[0])
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
