import React from "react"

interface CodeEditorProps {
	templateId: number | null
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ templateId }) => {
	return (
		<div className="h-full p-4">
			<textarea
				className="w-full h-full p-4 font-mono text-sm bg-gray-50 border rounded resize-none"
				placeholder="Write your email template code here..."
			/>
		</div>
	)
}
