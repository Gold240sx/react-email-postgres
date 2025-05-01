import { Preview as PreviewImport } from "@react-email/components"
import * as React from "react"

interface PreviewProps {
	children: string
}

const Preview: React.FC<PreviewProps> = ({ children }) => {
	return <PreviewImport>{children}</PreviewImport>
}

export default Preview
