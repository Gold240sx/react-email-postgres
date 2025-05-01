import type { EmailTemplate } from "@/db/schema"

export interface TreeItem {
	id: string
	name: string
	description: string | null
	type: "folder" | "template"
	parentId?: string | null
	children?: TreeItem[]
	templates?: EmailTemplate[]
}

export interface FolderTreeProps {
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

export interface FolderTreeItemProps {
	item: TreeItem
	level?: number
	selectedId?: string | null
	onSelect?: (id: string | null) => void
	onDrop?: (
		itemId: string,
		targetFolderId: string | null,
		itemType: "folder" | "template"
	) => void
	onRename?: (id: string) => void
	onDelete?: (id: string) => void
}
