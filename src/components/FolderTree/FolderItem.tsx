import { useState } from "react"
import {
	ChevronDown,
	ChevronRight,
	FolderOpen,
	Folder,
	MoreVertical,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useFolderItem, useMenu, useRename } from "./hooks"
import type { FolderTreeItemProps } from "./types"

export function FolderItem({
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
		setNodeRef,
		setDropRef,
		attributes,
		listeners,
		isDragging,
		isOver,
	} = useFolderItem(item)
	const { menuRef, isMenuOpen, setIsMenuOpen } = useMenu(onRename, onDelete)
	const {
		isRenaming,
		newName,
		inputRef,
		setNewName,
		setIsRenaming,
		handleRename,
		handleKeyDown,
	} = useRename(item, onRename)

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation()
		if (isFolder) {
			setIsExpanded(!isExpanded)
		}
		onSelect?.(item.id)
	}

	return (
		<div className="relative">
			<div
				ref={setDropRef}
				className={cn(
					"group relative flex items-center py-2 rounded cursor-pointer transition-colors duration-150",
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
					ref={setNodeRef}
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
					) : null}
					{isRenaming ? (
						<input
							ref={inputRef}
							type="text"
							value={newName}
							onChange={(e) => setNewName(e.target.value)}
							onBlur={handleRename}
							onKeyDown={handleKeyDown}
							className="flex-1 min-w-0 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
						/>
					) : (
						<span className="truncate">{item.name}</span>
					)}
				</div>
				<div
					className="ml-auto opacity-0 group-hover:opacity-100"
					ref={menuRef}>
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
									setIsRenaming(true)
									setIsMenuOpen(false)
								}}>
								Rename
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation()
									onDelete?.(item.id)
									setIsMenuOpen(false)
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
						<FolderItem
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
						<FolderItem
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
