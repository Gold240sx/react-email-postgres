import { drizzle } from "drizzle-orm/neon-serverless"
import { Pool } from "@neondatabase/serverless"
import * as dotenv from "dotenv"
import { emailTemplates } from "./schema"

dotenv.config()

const welcomeTemplate = `
import * as React from "react"
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from "@react-email/components"

export default function WelcomeEmail({ username = "{username}", userEmail = "{userEmail}" }) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#ffffff", fontFamily: "sans-serif" }}>
        <Container>
          <Section>
            <Text style={{ fontSize: "24px", fontWeight: "bold" }}>Welcome, {username}! 👋</Text>
            <Text>
              We're excited to have you on board. Your account has been successfully created
              with the email address: {userEmail}
            </Text>
            <Button href="https://your-app.com/get-started">
              Get Started
            </Button>
            <Hr />
            <Text style={{ color: "#666666", fontSize: "14px" }}>
              If you didn't create this account, please ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}`

const seed = async () => {
	if (!process.env.DATABASE_URL) {
		throw new Error("DATABASE_URL is not defined")
	}

	const pool = new Pool({ connectionString: process.env.DATABASE_URL })
	const db = drizzle(pool)

	console.log("Seeding database...")

	await db.insert(emailTemplates).values({
		name: "Welcome Email",
		description: "The default welcome email sent to new users",
		subject: "Welcome to Our Platform! 🎉",
		content: welcomeTemplate,
		variables: {
			username: "User's name",
			userEmail: "User's email address",
		},
	})

	console.log("Seeding completed!")
	await pool.end()
}

seed().catch((err) => {
	console.error("Error seeding database:", err)
	process.exit(1)
})
