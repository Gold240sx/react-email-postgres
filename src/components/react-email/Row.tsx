import { Row as RowImport } from "@react-email/components"
import * as React from "react"

interface RowProps {
	children: React.ReactNode
	className?: string
	style?: React.CSSProperties
	align?: "left" | "center" | "right"
}

const Row: React.FC<RowProps> = ({
	children,
	className,
	style,
	align = "left",
}) => {
	return (
		<RowImport
			className={className}
			style={{
				textAlign: align,
				...style,
			}}>
			{children}
		</RowImport>
	)
}

export default Row
