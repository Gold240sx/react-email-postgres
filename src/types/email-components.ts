export type EmailComponentType =
	| "button"
	| "container"
	| "font"
	| "heading"
	| "hr"
	| "image"
	| "link"
	| "markdown"
	| "preview"
	| "section"
	| "text"

export interface EmailComponentData {
	id: string
	type: EmailComponentType
	props: Record<string, any>
}

export interface DraggableComponentProps {
	type: EmailComponentType
	label: string
	defaultProps: Record<string, any>
}
