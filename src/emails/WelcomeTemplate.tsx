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

interface WelcomeEmailProps {
	username?: string
	userEmail?: string
}

export const WelcomeTemplate: React.FC<WelcomeEmailProps> = ({
	username = "there",
	userEmail = "user@example.com",
}) => {
	return (
		<Html>
			<Head />
			<Body style={main}>
				<Container style={container}>
					<Section>
						<Text style={heading}>Welcome, {username}! 👋</Text>
						<Text style={paragraph}>
							We're excited to have you on board. Your account has
							been successfully created with the email address:{" "}
							{userEmail}
						</Text>
						<Button
							href="https://your-app.com/get-started"
							style={button}>
							Get Started
						</Button>
						<Hr style={hr} />
						<Text style={footer}>
							If you didn't create this account, please ignore
							this email.
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	)
}

// Styles
const main = {
	backgroundColor: "#ffffff",
	fontFamily:
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
	margin: "0 auto",
	padding: "20px 0 48px",
	maxWidth: "580px",
}

const heading = {
	fontSize: "32px",
	lineHeight: "1.3",
	fontWeight: "700",
	color: "#1a1a1a",
}

const paragraph = {
	fontSize: "16px",
	lineHeight: "26px",
	color: "#484848",
}

const button = {
	backgroundColor: "#5850ec",
	borderRadius: "5px",
	color: "#fff",
	fontSize: "16px",
	fontWeight: "bold",
	textDecoration: "none",
	textAlign: "center" as const,
	display: "block",
	padding: "12px",
}

const hr = {
	borderColor: "#cccccc",
	margin: "20px 0",
}

const footer = {
	color: "#8898aa",
	fontSize: "12px",
}

export default WelcomeTemplate
