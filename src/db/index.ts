import { drizzle } from "drizzle-orm/neon-serverless"
import { Pool } from "@neondatabase/serverless"
import * as schema from "./schema"

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not set")
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// Test the connection
pool.connect()
	.then(() => {
		console.log("Successfully connected to database")
	})
	.catch((err) => {
		console.error("Failed to connect to database:", err)
	})

export const db = drizzle(pool, { schema })
