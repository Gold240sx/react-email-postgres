import { Head as HeadImport } from "@react-email/components"
import * as React from "react"

interface HeadProps {
	children: React.ReactNode
}

const Head: React.FC<HeadProps> = ({ children }) => {
	return <HeadImport>{children}</HeadImport>
}

export default Head
