import { Html } from "@react-email/components"
import * as React from "react"

interface HTMLProps {
	children: React.ReactNode
	lang?: string
	dir?: "ltr" | "rtl"
}

const HTML: React.FC<HTMLProps> = ({ children, lang = "en", dir = "ltr" }) => {
	return (
		<Html lang={lang} dir={dir}>
			{children}
		</Html>
	)
}

export default HTML
