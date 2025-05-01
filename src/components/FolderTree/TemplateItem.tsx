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
		<div className="relative">
			<div
				ref={setNodeRef}
				{...attributes}
				{...listeners}
				className={cn(
					"group relative flex items-center px-6 py-2 rounded cursor-pointer transition-colors duration-150",
					selectedId === item.id && "bg-blue-100",
					isDragging && "bg-blue-50 opacity-50",
					"hover:bg-gray-100"
				)}
				onClick={() => onSelect?.(item.id)}>
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
				<div className="flex items-center gap-2 flex-1">
					<FileText className="w-4 h-4 text-gray-500" />
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
						<span className="flex-1 text-left">{item.name}</span>
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
		</div>
	)
}
