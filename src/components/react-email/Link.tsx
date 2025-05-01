import { Link as LinkImport } from "@react-email/components"
import * as React from "react"

interface LinkProps {
	href: string
	className?: string
	style?: React.CSSProperties
	children: React.ReactNode
	target?: "_blank" | "_self"
	rel?: string
}

const defaultStyle: React.CSSProperties = {
	color: "#067df7",
	textDecoration: "underline",
}

const Link: React.FC<LinkProps> = ({
	href,
	className,
	style = defaultStyle,
	children,
	target = "_blank",
	rel = "noopener noreferrer",
}) => {
	return (
		<LinkImport
			href={href}
			className={className}
			style={style}
			target={target}
			rel={rel}>
			{children}
		</LinkImport>
	)
}

export default Link
