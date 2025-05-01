import React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
	EmailComponentData,
	EmailComponentType,
} from "@/types/email-components"
import * as Components from "@/components/react-email"

const componentMap: Record<EmailComponentType, React.ComponentType<any>> = {
	button: Components.Button,
	container: Components.Container,
	font: Components.Font,
	heading: Components.Heading,
	hr: Components.Hr,
	image: Components.Image,
	link: Components.Link,
	markdown: Components.Markdown,
	preview: Components.Preview,
	section: Components.Section,
	text: Components.Text,
}

interface EmailCanvasProps {
	components: EmailComponentData[]
	onSelectComponent: (component: EmailComponentData) => void
	onDeleteComponent: (id: string) => void
}

const SortableComponent: React.FC<{
	component: EmailComponentData
	onSelect: (component: EmailComponentData) => void
	onDelete: (id: string) => void
}> = ({ component, onSelect, onDelete }) => {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: component.id })

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	}

	const ComponentToRender = componentMap[component.type]

	if (!ComponentToRender) {
		console.error(`Component type ${component.type} not found`)
		return null
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className="p-4 mb-4 bg-white rounded shadow cursor-move"
			onClick={() => onSelect(component)}>
			<div className="flex justify-between mb-2">
				<span className="text-sm text-gray-500">{component.type}</span>
				<button
					className="text-red-500 hover:text-red-700"
					onClick={(e) => {
						e.stopPropagation()
						onDelete(component.id)
					}}>
					×
				</button>
			</div>
			<ComponentToRender {...component.props} />
		</div>
	)
}

export const EmailCanvas: React.FC<EmailCanvasProps> = ({
	components,
	onSelectComponent,
	onDeleteComponent,
}) => {
	return (
		<div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
			<div className="max-w-3xl mx-auto">
				{components.map((component) => (
					<SortableComponent
						key={component.id}
						component={component}
						onSelect={onSelectComponent}
						onDelete={onDeleteComponent}
					/>
				))}
			</div>
		</div>
	)
}

export default EmailCanvas
