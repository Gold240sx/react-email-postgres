import { Button as ButtonImport } from "@react-email/components"
import * as React from "react"

interface ButtonProps {
	children: React.ReactNode
	href: string
	className?: string
	style?: React.CSSProperties
	target?: string
	rel?: string
}

const Button: React.FC<ButtonProps> = ({
	children,
	href,
	className,
	style,
	target = "_blank",
	rel = "noopener noreferrer",
}) => {
	return (
		<ButtonImport
			href={href}
			className={className}
			style={style}
			target={target}
			rel={rel}>
			{children}
		</ButtonImport>
	)
}

export default Button
