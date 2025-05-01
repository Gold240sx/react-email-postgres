import { Font as FontImport } from "@react-email/components"
import * as React from "react"

interface FontProps {
	fontFamily: string
	fallbackFontFamily?: string
	webFont?: {
		url: string
		format: string
	}
	fontWeight?: number | string
	fontStyle?: string
}

const defaultWebFont = {
	url: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
	format: "woff2",
}

const Font: React.FC<FontProps> = ({
	fontFamily = "Roboto",
	fallbackFontFamily = "Verdana",
	webFont = defaultWebFont,
	fontStyle = "normal",
	fontWeight = 400,
}) => {
	const Component = FontImport as any
	return (
		<Component
			fontFamily={fontFamily}
			fallbackFontFamily={fallbackFontFamily}
			webFont={webFont}
			fontStyle={fontStyle}
			fontWeight={fontWeight}
		/>
	)
}

export default Font
