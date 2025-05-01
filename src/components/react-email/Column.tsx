import { Column as ColumnImport } from "@react-email/components"
import * as React from "react"

interface ColumnProps {
	children: React.ReactNode
	className?: string
	style?: React.CSSProperties
	align?: "left" | "center" | "right"
	width?: string | number
}

const Column: React.FC<ColumnProps> = ({
	children,
	className,
	style,
	align = "left",
	width,
}) => {
	return (
		<ColumnImport
			className={className}
			style={{
				textAlign: align,
				width: width ? `${width}px` : "auto",
				...style,
			}}>
			{children}
		</ColumnImport>
	)
}

export default Column
