import React, { useState } from "react"
import {
	DragEndEvent,
	DragStartEvent,
	DragOverlay,
	useDroppable,
} from "@dnd-kit/core"
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { EmailCanvas } from "./EmailCanvas"
import ComponentEditor from "./ComponentEditor"
import {
	EmailComponentData,
	EmailComponentType,
} from "@/types/email-components"
import { nanoid } from "nanoid"

export const DndEditor: React.FC = () => {
	const [components, setComponents] = useState<EmailComponentData[]>([])
	const [selectedComponent, setSelectedComponent] =
		useState<EmailComponentData | null>(null)
	const [activeId, setActiveId] = useState<string | null>(null)

	const { setNodeRef: setDroppableRef, isOver } = useDroppable({
		id: "canvas-droppable",
	})

	const handleDragStart = (event: DragStartEvent) => {
		console.log("drag start", event)
		setActiveId(event.active.id as string)
	}

	const handleDragEnd = (event: DragEndEvent) => {
		console.log("drag end", event)
		const { active, over } = event
		setActiveId(null)

		if (!over) return

		// If dragging from palette
		if (active.data.current?.type && isOver) {
			const newComponent: EmailComponentData = {
				id: nanoid(),
				type: active.data.current.type as EmailComponentType,
				props: active.data.current.defaultProps || {},
			}
			setComponents((prev) => [...prev, newComponent])
			return
		}

		// If reordering existing components
		if (active.id !== over.id) {
			setComponents((items) => {
				const oldIndex = items.findIndex(
					(item) => item.id === active.id
				)
				const newIndex = items.findIndex((item) => item.id === over.id)
				return arrayMove(items, oldIndex, newIndex)
			})
		}
	}

	const handleSelectComponent = (component: EmailComponentData) => {
		setSelectedComponent(component)
	}

	const handleUpdateComponent = (id: string, props: Record<string, any>) => {
		setComponents((items) =>
			items.map((item) => (item.id === id ? { ...item, props } : item))
		)
		if (selectedComponent?.id === id) {
			setSelectedComponent((prev) => (prev ? { ...prev, props } : null))
		}
	}

	const handleDeleteComponent = (id: string) => {
		setComponents((items) => items.filter((item) => item.id !== id))
		if (selectedComponent?.id === id) {
			setSelectedComponent(null)
		}
	}

	return (
		<div className="flex h-full">
			<div
				ref={setDroppableRef}
				className={`flex-1 p-4 ${
					isOver ? "bg-blue-50" : "bg-gray-50"
				}`}>
				<SortableContext
					items={components}
					strategy={verticalListSortingStrategy}>
					<EmailCanvas
						components={components}
						onSelectComponent={handleSelectComponent}
						onDeleteComponent={handleDeleteComponent}
					/>
				</SortableContext>
				<DragOverlay>
					{activeId ? (
						<div className="p-4 bg-white rounded shadow opacity-50">
							Dragging component...
						</div>
					) : null}
				</DragOverlay>
			</div>
			<div className="w-80 border-l bg-gray-50 overflow-y-auto">
				{selectedComponent ? (
					<ComponentEditor
						component={selectedComponent}
						onUpdate={handleUpdateComponent}
					/>
				) : (
					<div className="p-4 text-center text-gray-500">
						Select a component to edit its properties
					</div>
				)}
			</div>
		</div>
	)
}

export default DndEditor
