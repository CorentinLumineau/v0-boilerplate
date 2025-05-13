import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { neon } from "@neondatabase/serverless"

// Create a SQL executor using the Neon serverless driver
const sql = neon(process.env.NEON_NEON_DATABASE_URL || "")

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validate input
    const validation = userSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ message: validation.error.errors[0].message }, { status: 400 })
    }

    const { name, email, password } = body

    // Check if user already exists
    const existingUsers = await sql`SELECT * FROM "User" WHERE email = ${email} LIMIT 1`

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate a unique ID (similar to cuid)
    const id = `cl${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`

    // Create user
    const result = await sql`
      INSERT INTO "User" (id, name, email, password)
      VALUES (${id}, ${name}, ${email}, ${hashedPassword})
      RETURNING id, name, email
    `

    const user = result[0]

    return NextResponse.json({ message: "User created successfully", user }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}
