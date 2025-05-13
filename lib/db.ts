import { neon } from "@neondatabase/serverless"

// Create a SQL executor using the Neon serverless driver
const sql = neon(process.env.NEON_NEON_DATABASE_URL || "")

export default sql
