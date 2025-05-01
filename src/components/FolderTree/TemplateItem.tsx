import { FileText, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTemplateItem, useMenu, useRename } from "./hooks"
import type { FolderTreeItemProps } from "./types"

export function TemplateItem({
	item,
	level = 0,
	selectedId,
	onSelect,
	onRename,
	onDelete,
}: FolderTreeItemProps) {
	const { setNodeRef, attributes, listeners, isDragging } =
		useTemplateItem(item)
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

	return (
		<div
			ref={setNodeRef}
			{...attributes}
			{...listeners}
			className={cn(
				"group flex items-center py-2 mx-1 rounded cursor-pointer transition-colors duration-150 w-auto hover:bg-gray-100",
				selectedId === item.id && "bg-blue-100",
				isDragging && "bg-blue-50 opacity-50"
			)}>
			<div
				className="flex items-center gap-2 px-2 flex-1"
				onClick={() => onSelect?.(item.id)}>
				<FileText className="w-4 h-4 text-gray-500" />
				{isRenaming ? (
					<input
						ref={inputRef}
						type="text"
						value={newName}
						onChange={(e) => setNewName(e.target.value)}
						onBlur={handleRename}
						onKeyDown={handleKeyDown}
						className="min-w-0 bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-blue-600 caret-blue-600"
					/>
				) : (
					<span className="text-left">{item.name}</span>
				)}
			</div>
			<div
				className="opacity-0 group-hover:opacity-100 px-2"
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
	)
}
