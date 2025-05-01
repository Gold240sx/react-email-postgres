import { Container as ContainerImport } from "@react-email/components"
import * as React from "react"

interface ContainerProps {
	children: React.ReactNode
	className?: string
	style?: React.CSSProperties
}

const defaultStyle: React.CSSProperties = {
	margin: "0 auto",
	padding: "20px 0 48px",
	maxWidth: "580px",
}

const Container: React.FC<ContainerProps> = ({
	children,
	className,
	style = defaultStyle,
}) => {
	return (
		<ContainerImport className={className} style={style}>
			{children}
		</ContainerImport>
	)
}

export default Container
