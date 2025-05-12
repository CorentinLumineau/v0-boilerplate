import { Pool } from "pg"

// Create a connection pool to the Neon database
const pool = new Pool({
  connectionString: process.env.NEON_NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

export default pool
