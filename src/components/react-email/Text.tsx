import { Text as TextImport } from "@react-email/components"
import * as React from "react"

interface TextProps {
	children: React.ReactNode
	className?: string
	style?: React.CSSProperties
}

const defaultStyle: React.CSSProperties = {
	fontSize: "14px",
	lineHeight: "24px",
	margin: "16px 0",
}

const Text: React.FC<TextProps> = ({
	children,
	className,
	style = defaultStyle,
}) => {
	return (
		<TextImport className={className} style={style}>
			{children}
		</TextImport>
	)
}

export default Text
