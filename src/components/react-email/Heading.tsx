import { Heading as HeadingImport } from "@react-email/components"
import * as React from "react"

interface HeadingProps {
	children: React.ReactNode
	className?: string
	style?: React.CSSProperties
	as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}

const defaultStyle: React.CSSProperties = {
	margin: "16px 0",
}

const Heading: React.FC<HeadingProps> = ({
	children,
	className,
	style = defaultStyle,
	as = "h1",
}) => {
	return (
		<HeadingImport className={className} style={style} as={as}>
			{children}
		</HeadingImport>
	)
}

export default Heading
