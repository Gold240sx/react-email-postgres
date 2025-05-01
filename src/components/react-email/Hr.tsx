import { Hr as HrImport } from "@react-email/components"
import * as React from "react"

interface HrProps {
	className?: string
	style?: React.CSSProperties
}

const defaultStyle: React.CSSProperties = {
	borderColor: "#e6ebf1",
	margin: "20px 0",
}

const Hr: React.FC<HrProps> = ({ className, style = defaultStyle }) => {
	return <HrImport className={className} style={style} />
}

export default Hr
