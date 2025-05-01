import { useDroppable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"
import { FolderItem } from "./FolderItem"
import { TemplateItem } from "./TemplateItem"
import type { FolderTreeProps } from "./types"

export function FolderTree({
	items,
	selectedId,
	onSelect,
	onDrop,
	onRename,
	onDelete,
}: FolderTreeProps) {
	const { setNodeRef, isOver } = useDroppable({
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

	return (
		<div
			ref={setNodeRef}
			className={cn(
				"flex flex-col gap-1 rounded-lg py-2",
				isOver ? "bg-blue-50" : "bg-transparent"
			)}
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
