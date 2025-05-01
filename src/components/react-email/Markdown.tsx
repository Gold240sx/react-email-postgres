import { Markdown as MarkdownImport } from "@react-email/components"
import * as React from "react"

interface MarkdownProps {
	children: string
}

const Markdown: React.FC<MarkdownProps> = ({ children }) => {
	return <MarkdownImport>{children}</MarkdownImport>
}

export default Markdown
