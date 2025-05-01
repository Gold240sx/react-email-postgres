import { useDraggable, useDroppable } from "@dnd-kit/core"
import { useRef, useEffect, useState } from "react"
import type { TreeItem } from "./types"
import { toast } from "sonner"

export const useFolderItem = (item: TreeItem) => {
	const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
		id: item.id,
		data: {
			id: item.id,
			type: item.type,
		},
	})

	const { setNodeRef: setDropRef, isOver } = useDroppable({
		id: item.id,
		data: { id: item.id, type: item.type },
		disabled: item.type !== "folder",
	})

	return {
		setNodeRef,
		setDropRef,
		attributes,
		listeners,
		isDragging,
		isOver,
	}
}

export const useTemplateItem = (item: TreeItem) => {
	const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
		id: item.id,
		data: {
			id: item.id,
			type: item.type,
		},
	})

	return {
		setNodeRef,
		attributes,
		listeners,
		isDragging,
	}
}

export const useMenu = (
	onRename?: (id: string) => void,
	onDelete?: (id: string) => void
) => {
	const menuRef = useRef<HTMLDivElement>(null)
	const [isMenuOpen, setIsMenuOpen] = useState(false)

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				menuRef.current &&
				!menuRef.current.contains(event.target as Node)
			) {
				setIsMenuOpen(false)
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () =>
			document.removeEventListener("mousedown", handleClickOutside)
	}, [])

	return {
		menuRef,
		isMenuOpen,
		setIsMenuOpen,
	}
}

export const useRename = (
	item: TreeItem,
	onRename?: (id: string, newName: string) => void
) => {
	const [isRenaming, setIsRenaming] = useState(false)
	const [newName, setNewName] = useState(item.name)
	const inputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (isRenaming && inputRef.current) {
			inputRef.current.focus()
			inputRef.current.select()
		}
	}, [isRenaming])

	const handleRename = () => {
		if (newName.trim() && newName !== item.name) {
			onRename?.(item.id, newName)
			toast.success(
				`${
					item.type === "folder" ? "Folder" : "Template"
				} renamed successfully`
			)
		}
		setIsRenaming(false)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault()
			handleRename()
		} else if (e.key === "Escape") {
			e.preventDefault()
			setIsRenaming(false)
			setNewName(item.name)
		} else if (e.key === " ") {
			e.preventDefault()
			// Allow the space to be added to the input
			setNewName((prev) => prev + " ")
		}
	}

	return {
		isRenaming,
		newName,
		inputRef,
		setNewName,
		setIsRenaming,
		handleRename,
		handleKeyDown,
	}
}
