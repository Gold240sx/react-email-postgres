import React from "react"
import { useDraggable } from "@dnd-kit/core"
import {
	EmailComponentData,
	DraggableComponentProps,
} from "@/types/email-components"
import { nanoid } from "nanoid"
import {
	Type,
	Heading,
	Text as TextIcon,
	Image as ImageIcon,
	Square as ButtonIcon,
	Link as LinkIcon,
	Minus,
	FileText,
} from "lucide-react"

interface ComponentPaletteProps {
	onAddComponent: (component: EmailComponentData) => void
}

const availableComponents: (DraggableComponentProps & {
	icon: React.ElementType
})[] = [
	{
		type: "font",
		label: "Font",
		icon: Type,
		defaultProps: {
			fontFamily: "Roboto",
			fallbackFontFamily: "Verdana",
			webFont: {
				url: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
				format: "woff2",
			},
			fontWeight: 400,
			fontStyle: "normal",
		},
	},
	{
		type: "heading",
		label: "Heading",
		icon: Heading,
		defaultProps: {
			children: "New Heading",
			as: "h1",
		},
	},
	{
		type: "text",
		label: "Text",
		icon: TextIcon,
		defaultProps: {
			children: "New text block",
		},
	},
	{
		type: "image",
		label: "Image",
		icon: ImageIcon,
		defaultProps: {
			src: "https://via.placeholder.com/150",
			alt: "Placeholder image",
			width: 150,
		},
	},
	{
		type: "button",
		label: "Button",
		icon: ButtonIcon,
		defaultProps: {
			href: "#",
			children: "Click me",
		},
	},
	{
		type: "link",
		label: "Link",
		icon: LinkIcon,
		defaultProps: {
			href: "#",
			children: "Click here",
		},
	},
	{
		type: "hr",
		label: "Horizontal Rule",
		icon: Minus,
		defaultProps: {},
	},
	{
		type: "markdown",
		label: "Markdown",
		icon: FileText,
		defaultProps: {
			children: "# Markdown\nWrite your content here",
		},
	},
]

const DraggableComponent: React.FC<{
	component: DraggableComponentProps & { icon: React.ElementType }
	onAdd: (component: EmailComponentData) => void
}> = ({ component, onAdd }) => {
	const { attributes, listeners, setNodeRef, transform, isDragging } =
		useDraggable({
			id: `component-${component.type}`,
			data: {
				type: component.type,
				defaultProps: component.defaultProps,
			},
		})

	const style = transform
		? {
				transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
				opacity: isDragging ? 0.5 : undefined,
		  }
		: undefined

	const Icon = component.icon

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...listeners}
			{...attributes}
			className="flex items-center gap-2 p-2 mb-2 bg-white rounded shadow cursor-move hover:bg-gray-50 active:cursor-grabbing">
			<Icon className="w-4 h-4" />
			<span>{component.label}</span>
		</div>
	)
}

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({
	onAddComponent,
}) => {
	return (
		<div className="w-64 p-4 bg-gray-100">
			<h2 className="mb-4 text-lg font-semibold">Components</h2>
			<div className="space-y-2">
				{availableComponents.map((component) => (
					<DraggableComponent
						key={component.type}
						component={component}
						onAdd={onAddComponent}
					/>
				))}
			</div>
		</div>
	)
}

export default ComponentPalette
