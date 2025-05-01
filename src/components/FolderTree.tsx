import React, { useState } from "react"
import {
	ChevronDown,
	ChevronRight,
	FolderOpen,
	Folder,
	FileText,
	MoreVertical,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { EmailTemplate, EmailTemplateFolder } from "@/db/schema"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TreeItem {
	id: string
	name: string
	description: string | null
	type: "folder" | "template"
	parentId?: string | null
	children?: TreeItem[]
	templates?: EmailTemplate[]
}

interface FolderTreeProps {
	items: any[]
	selectedId?: string | null
	onSelect?: (id: string | null) => void
	onDrop?: (
		itemId: string,
		targetFolderId: string | null,
		itemType: "template" | "folder"
	) => void
	onRename?: (id: string) => void
	onDelete?: (id: string) => void
}

interface FolderTreeItemProps {
	item: TreeItem
	level?: number
	selectedId?: string | undefined
	onSelect?: (id: string | undefined) => void
	onDrop?: (
		itemId: string,
		targetFolderId: string | null,
		itemType: "folder" | "template"
	) => void
	onRename?: (id: string) => void
	onDelete?: (id: string) => void
}

function FolderTreeItem({
	item,
	level = 0,
	selectedId,
	onSelect,
	onDrop,
	onRename,
	onDelete,
}: FolderTreeItemProps) {
	const [isExpanded, setIsExpanded] = useState(false)
	const isFolder = item.type === "folder"
	const hasChildren =
		isFolder &&
		((item.children && item.children.length > 0) ||
			(item.templates && item.templates.length > 0))

	const {
		setNodeRef: setDragRef,
		attributes,
		listeners,
		isDragging,
	} = useDraggable({
		id: item.id,
		data: {
			id: item.id,
			type: item.type,
		},
	})

	const { setNodeRef: setDropRef, isOver } = useDroppable({
		id: item.id,
		data: { id: item.id, type: item.type },
		disabled: !isFolder,
	})

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation()
		if (isFolder) {
			console.log("clicked on a folder")
			setIsExpanded(!isExpanded)
		}
		onSelect?.(item.id)
	}

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault()

		const itemId = e.dataTransfer.getData("text/plain")
		const itemType = e.dataTransfer.getData("text/type")
		console.log(`Dropped Item onto a ${itemType} with the id of ${itemId}`)
		onDrop?.(itemId, item.id, itemType as "folder" | "template")
	}

	return (
		<div className="relative">
			<div
				ref={setDropRef}
				className={cn(
					"group relative flex items-center p-2 rounded cursor-pointer transition-colors duration-150",
					selectedId === item.id && "bg-blue-100",
					isDragging && "bg-blue-50 opacity-50",
					!selectedId && isOver && "bg-gray-100",
					"hover:bg-gray-100"
				)}
				onClick={handleClick}>
				{level > 0 && (
					<div
						id="folder-tree-line"
						className="absolute border-l border-gray-300"
						style={{
							height: "100%",
							top: 0,
						}}
					/>
				)}
				<div
					ref={setDragRef}
					{...listeners}
					{...attributes}
					className="flex items-center flex-1">
					{hasChildren ? (
						<div className="p-1">
							{isExpanded ? (
								<ChevronDown className="h-4 w-4" />
							) : (
								<ChevronRight className="h-4 w-4" />
							)}
						</div>
					) : (
						<div className="w-6" />
					)}
					{isFolder ? (
						<>
							{isExpanded ? (
								<FolderOpen
									size={16}
									className="mr-2 text-gray-500"
								/>
							) : (
								<Folder
									size={16}
									className="mr-2 text-gray-500"
								/>
							)}
						</>
					) : (
						<FileText size={16} className="mr-2 text-gray-500" />
					)}
					<span className="truncate">{item.name}</span>
					<span className="text-xs text-gray-400">
						{item.id.replace("F-", "")}
					</span>
				</div>
				<div className="ml-auto opacity-0 group-hover:opacity-100">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button
								className="p-1 hover:bg-gray-200 rounded-sm"
								onClick={(e) => e.stopPropagation()}>
								<MoreVertical className="h-4 w-4" />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation()
									onRename?.(item.id)
								}}>
								Rename
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation()
									onDelete?.(item.id)
								}}>
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
			{isFolder && isExpanded && (
				<div>
					{item.children?.map((child) => (
						<FolderTreeItem
							key={child.id}
							item={child}
							level={level + 1}
							selectedId={selectedId}
							onSelect={onSelect}
							onDrop={onDrop}
							onRename={onRename}
							onDelete={onDelete}
						/>
					))}
					{item.templates?.map((template) => (
						<FolderTreeItem
							key={template.id}
							item={{
								id: String(template.id),
								name: template.name,
								description: template.description,
								type: "template",
								parentId: template.folderId
									? String(template.folderId)
									: null,
							}}
							level={level + 1}
							selectedId={selectedId}
							onSelect={onSelect}
							onDrop={onDrop}
							onRename={onRename}
							onDelete={onDelete}
						/>
					))}
				</div>
			)}
		</div>
	)
}

export function FolderTree({
	items,
	selectedId,
	onSelect,
	onDrop,
	onRename,
	onDelete,
}: FolderTreeProps) {
	const { setNodeRef: setDropRef, isOver } = useDroppable({
		id: "root",
		data: {
			id: "root",
			type: "root",
		},
	})

	const handleContainerClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			e.stopPropagation()
			onSelect?.(null)
		}
	}

	console.log("Root Drop Zone State:", {
		isOver,
	})

	return (
		<div
			ref={setDropRef}
			className={cn("space-y-1", isOver && "bg-gray-100 rounded-md p-2")}
			onClick={handleContainerClick}>
			{items.map((item) => (
				<div key={item.id}>
					{item.type === "folder" ? (
						<FolderItem
							item={item}
							selectedId={selectedId}
							onSelect={onSelect}
							onDrop={onDrop}
							onRename={onRename}
							onDelete={onDelete}
						/>
					) : (
						<TemplateItem
							item={item}
							selectedId={selectedId}
							onSelect={onSelect}
							onDrop={onDrop}
							onRename={onRename}
							onDelete={onDelete}
						/>
					)}
				</div>
			))}
		</div>
	)
}

function FolderItem({
	item,
	selectedId,
	onSelect,
	onDrop,
	onRename,
	onDelete,
}: {
	item: any
	selectedId?: string | null
	onSelect?: (id: string | null) => void
	onDrop?: (
		itemId: string,
		targetFolderId: string | null,
		itemType: "template" | "folder"
	) => void
	onRename?: (id: string) => void
	onDelete?: (id: string) => void
}) {
	const [isOpen, setIsOpen] = React.useState(false)
	const displayId = item.id

	const {
		setNodeRef: setDragRef,
		attributes,
		listeners,
		isDragging,
	} = useDraggable({
		id: item.id,
		data: {
			id: item.id,
			type: item.type,
		},
	})

	const { setNodeRef: setDropRef, isOver } = useDroppable({
		id: item.id,
		data: {
			id: item.id,
			type: item.type,
		},
	})

	return (
		<div className="relative">
			<div
				ref={setDropRef}
				className={cn(
					"group relative flex items-center p-2 rounded cursor-pointer transition-colors duration-150",
					selectedId === item.id && "bg-blue-100",
					isDragging && "bg-blue-50 opacity-50",
					!selectedId && isOver && "bg-gray-100",
					"hover:bg-gray-100"
				)}
				onClick={() => setIsOpen(!isOpen)}>
				<div
					ref={setDragRef}
					{...attributes}
					{...listeners}
					className="flex items-center gap-2 flex-1">
					{isOpen ? (
						<FolderOpen className="w-4 h-4 text-gray-500" />
					) : (
						<Folder className="w-4 h-4 text-gray-500" />
					)}
					<span className="flex-1 text-left">{item.name}</span>
					<span className="text-xs text-gray-400">{displayId}</span>
				</div>
				<div className="ml-auto opacity-0 group-hover:opacity-100">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button
								className="p-1 hover:bg-gray-200 rounded-sm"
								onClick={(e) => e.stopPropagation()}>
								<MoreVertical className="h-4 w-4" />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation()
									onRename?.(item.id)
								}}>
								Rename
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation()
									onDelete?.(item.id)
								}}>
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
			{isOpen && (
				<div className="ml-4 border-l border-gray-300 pl-1">
					<FolderTree
						items={[
							...(item.children || []).map((child: any) => ({
								...child,
								level: (item.level || 0) + 1,
							})),
							...(item.templates || []).map((template: any) => ({
								...template,
								level: (item.level || 0) + 1,
							})),
						]}
						selectedId={selectedId}
						onSelect={onSelect}
						onDrop={onDrop}
						onRename={onRename}
						onDelete={onDelete}
					/>
				</div>
			)}
		</div>
	)
}

function TemplateItem({
	item,
	selectedId,
	onSelect,
	onDrop,
	onRename,
	onDelete,
}: {
	item: any
	selectedId?: string | null
	onSelect?: (id: string | null) => void
	onDrop?: (
		itemId: string,
		targetFolderId: string | null,
		itemType: "template" | "folder"
	) => void
	onRename?: (id: string) => void
	onDelete?: (id: string) => void
}) {
	const displayId = item.id

	const {
		setNodeRef: setDragRef,
		attributes,
		listeners,
		isDragging,
	} = useDraggable({
		id: item.id,
		data: {
			id: item.id,
			type: item.type,
		},
	})

	return (
		<div className="relative">
			<div
				ref={setDragRef}
				{...attributes}
				{...listeners}
				className={cn(
					"group relative flex items-center p-2 rounded cursor-pointer transition-colors duration-150",
					selectedId === item.id && "bg-blue-100",
					isDragging && "bg-blue-50 opacity-50",
					"hover:bg-gray-100"
				)}
				onClick={() => onSelect?.(item.id)}>
				<div className="flex items-center gap-2 flex-1">
					<FileText className="w-4 h-4 text-gray-500" />
					<span className="flex-1 text-left">{item.name}</span>
					<span className="text-xs text-gray-400">{displayId}</span>
				</div>
				<div className="ml-auto opacity-0 group-hover:opacity-100">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button
								className="p-1 hover:bg-gray-200 rounded-sm"
								onClick={(e) => e.stopPropagation()}>
								<MoreVertical className="h-4 w-4" />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation()
									onRename?.(item.id)
								}}>
								Rename
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation()
									onDelete?.(item.id)
								}}>
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</div>
	)
}
