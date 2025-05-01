import { Section as SectionImport } from "@react-email/components"
import * as React from "react"

interface SectionProps {
	children: React.ReactNode
	className?: string
	style?: React.CSSProperties
}

const Section: React.FC<SectionProps> = ({ children, className, style }) => {
	return (
		<SectionImport className={className} style={style}>
			{children}
		</SectionImport>
	)
}

export default Section
