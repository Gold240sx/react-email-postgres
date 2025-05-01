import { drizzle } from "drizzle-orm/neon-serverless"
import { migrate } from "drizzle-orm/neon-serverless/migrator"
import { Pool } from "@neondatabase/serverless"
import * as dotenv from "dotenv"

dotenv.config()

const runMigrate = async () => {
	if (!process.env.DATABASE_URL) {
		throw new Error("DATABASE_URL is not defined")
	}

	const pool = new Pool({ connectionString: process.env.DATABASE_URL })
	const db = drizzle(pool)

	console.log("Running migrations...")

	await migrate(db, { migrationsFolder: "drizzle" })

	console.log("Migrations completed!")

	await pool.end()
}

runMigrate().catch((err) => {
	console.error("Error running migrations:", err)
	process.exit(1)
})
