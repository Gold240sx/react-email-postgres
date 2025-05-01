"use client"

import React, { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeEditor } from "@/components/CodeEditor"
import { Preview } from "@/components/Preview"
import { DndEditor } from "@/components/DndEditor/DndEditor"
import { ComponentPalette } from "@/components/DndEditor/ComponentPalette"
import { DndEditorProvider } from "@/components/DndEditor/DndContext"
import { NewTemplateDialog } from "@/components/dialogs/NewTemplateDialog"
import { FolderTree } from "@/components/FolderTree/index"
import { DragHandleDots2Icon } from "@radix-ui/react-icons"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { EmailComponentData } from "@/types/email-components"
import { trpc } from "@/lib/trpc"
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragStartEvent,
	DragEndEvent,
	DragOverlay,
} from "@dnd-kit/core"
import { nanoid } from "nanoid"
import { FileText, Folder } from "lucide-react"

function buildTreeItems(items: any[]): any[] {
	console.log("Raw items:", JSON.stringify(items, null, 2))

	// Convert IDs to strings and add type field
	return items.map((item) => {
		if ("subject" in item || "content" in item) {
			// This is a template
			return {
				...item,
				id: `T-${item.id}`,
				folderId: item.folderId ? `F-${item.folderId}` : null,
				type: "template" as const,
			}
		} else {
			// This is a folder
			return {
				...item,
				id: `F-${item.id}`,
				parentId: item.parentId ? `F-${item.parentId}` : null,
				type: "folder" as const,
				children: item.children ? buildTreeItems(item.children) : [],
				templates: item.templates ? buildTreeItems(item.templates) : [],
			}
		}
	})
}

export default function Home() {
	const [components, setComponents] = useState<EmailComponentData[]>([])
	const [selectedTemplate, setSelectedTemplate] = useState<string | null>(
		null
	)
	const [activeTab, setActiveTab] = useState("code")
	const { data: templates, isLoading } = trpc.email.getTemplates.useQuery()
	const utils = trpc.useContext()
	const [activeId, setActiveId] = useState<string | null>(null)
	const [activeItem, setActiveItem] = useState<any | null>(null)

	const { mutate: updateTemplate } = trpc.email.updateTemplate.useMutation({
		onSuccess: () => {
			console.log("Template update successful")
			utils.email.getTemplates.invalidate()
		},
		onError: (error) => {
			console.error("Template update failed:", error)
		},
	})

	const { mutate: updateFolder } = trpc.email.updateFolder.useMutation({
		onSuccess: () => {
			console.log("Folder update successful")
			utils.email.getTemplates.invalidate()
		},
		onError: (error) => {
			console.error("Folder update failed:", error)
		},
	})

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(KeyboardSensor)
	)

	const handleDragStart = (event: DragStartEvent) => {
		const { active } = event
		setActiveId(String(active.id))
		document.body.setAttribute("data-dragging", "true")

		// Find the item being dragged
		const findItem = (items: any[]): any => {
			for (const item of items) {
				if (String(item.id) === String(active.id)) {
					return item
				}
				if (item.children) {
					const found = findItem(item.children)
					if (found) return found
				}
				if (item.templates) {
					const found = findItem(item.templates)
					if (found) return found
				}
			}
			return null
		}

		const draggedItem = findItem(templates || [])
		if (draggedItem) {
			setActiveItem({
				...draggedItem,
				type:
					draggedItem.type ||
					(draggedItem.subject ? "template" : "folder"),
			})
		}
	}

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event
		console.log("Drag End Event:", {
			active: {
				id: active.id,
				data: active.data.current,
			},
			over: over
				? {
						id: over.id,
						data: over.data.current,
				  }
				: null,
		})

		setActiveId(null)
		setActiveItem(null)
		document.body.removeAttribute("data-dragging")

		if (!over) {
			console.log("No valid drop target")
			return
		}

		const activeId = active.data.current?.id
		const activeType = active.data.current?.type
		const overId = over.data.current?.id
		const overType = over.data.current?.type

		if (!activeId) {
			console.log("Missing active data:", {
				activeId,
				activeType,
			})
			return
		}

		console.log("Processing drop:", {
			activeId,
			activeType,
			overId,
			overType,
		})

		// Handle root-level drops (when overId is "root")
		if (overId === "root") {
			console.log("Dropping item to root level")
			if (activeType === "template") {
				console.log("Updating template to root level:", {
					id: Number(activeId.replace("T-", "")),
					folderId: null,
				})
				updateTemplate({
					id: Number(activeId.replace("T-", "")),
					folderId: null,
				})
			} else if (activeType === "folder") {
				console.log("Updating folder to root level:", {
					id: Number(activeId.replace("F-", "")),
					parentId: null,
				})
				updateFolder({
					id: Number(activeId.replace("F-", "")),
					parentId: null,
				})
			}
			return
		}

		// Handle regular drops
		if (activeType === "template") {
			console.log("Updating template:", {
				id: Number(activeId.replace("T-", "")),
				folderId: Number(overId.replace("F-", "")),
			})
			updateTemplate({
				id: Number(activeId.replace("T-", "")),
				folderId: Number(overId.replace("F-", "")),
			})
		} else if (activeType === "folder") {
			if (overType === "template") {
				console.log("Dropping folder onto template")
				const template = findTemplate(
					templates || [],
					Number(overId.replace("T-", ""))
				)
				if (!template) {
					console.log("Template not found")
					return
				}

				const targetFolderId = template.folderId
				console.log("Using template's parent folder:", targetFolderId)

				if (targetFolderId) {
					const targetFolder = findFolder(
						templates || [],
						targetFolderId
					)
					if (
						!targetFolder ||
						isDescendant(
							templates || [],
							Number(activeId.replace("F-", "")),
							targetFolderId
						)
					) {
						console.log(
							"Invalid folder drop - target not found or would create cycle"
						)
						return
					}
				}

				console.log("Updating folder:", {
					id: Number(activeId.replace("F-", "")),
					parentId: targetFolderId,
				})
				updateFolder({
					id: Number(activeId.replace("F-", "")),
					parentId: targetFolderId,
				})
			} else {
				console.log("Dropping folder onto folder")
				if (overId) {
					const targetFolder = findFolder(
						templates || [],
						Number(overId.replace("F-", ""))
					)
					if (
						!targetFolder ||
						isDescendant(
							templates || [],
							Number(activeId.replace("F-", "")),
							Number(overId.replace("F-", ""))
						)
					) {
						console.log(
							"Invalid folder drop - target not found or would create cycle"
						)
						return
					}
				}

				console.log("Updating folder:", {
					id: Number(activeId.replace("F-", "")),
					parentId: Number(overId.replace("F-", "")),
				})
				updateFolder({
					id: Number(activeId.replace("F-", "")),
					parentId: Number(overId.replace("F-", "")),
				})
			}
		}
	}

	// Helper function to find a folder by ID
	const findFolder = (items: any[], id: number): any => {
		console.log("Finding folder with id:", id)
		for (const item of items) {
			const isFolder = !("subject" in item) && !("content" in item)
			if (isFolder && item.id === id) {
				console.log("Found folder:", item)
				return item
			}
			if (item.children) {
				const found = findFolder(item.children, id)
				if (found) return found
			}
		}
		console.log("Folder not found")
		return null
	}

	// Helper function to check if a folder is a descendant of another folder
	const isDescendant = (
		items: any[],
		folderId: number,
		targetId: number
	): boolean => {
		console.log("Checking if folder is descendant:", { folderId, targetId })
		const folder = findFolder(items, targetId)
		if (!folder) return false

		if (folder.parentId === folderId) {
			console.log("Direct descendant found")
			return true
		}

		if (folder.parentId) {
			return isDescendant(items, folderId, folder.parentId)
		}

		console.log("No descendant relationship found")
		return false
	}

	// Helper function to find a template by ID
	const findTemplate = (items: any[], id: number): any => {
		console.log("Finding template with id:", id)
		for (const item of items) {
			if ("subject" in item && item.id === id) {
				console.log("Found template:", item)
				return item
			}
			if (item.templates) {
				const found = findTemplate(item.templates, id)
				if (found) return found
			}
			if (item.children) {
				const found = findTemplate(item.children, id)
				if (found) return found
			}
		}
		console.log("Template not found")
		return null
	}

	const handleAddComponent = (component: EmailComponentData) => {
		setComponents((prev) => [...prev, component])
	}

	const handleDrop = (
		itemId: string,
		targetFolderId: string | null,
		itemType: "template" | "folder"
	) => {
		if (itemType === "template") {
			updateTemplate({
				id: Number(itemId.replace("T-", "")),
				folderId: targetFolderId
					? Number(targetFolderId.replace("F-", ""))
					: null,
			})
		} else if (itemType === "folder") {
			updateFolder({
				id: Number(itemId.replace("F-", "")),
				parentId: targetFolderId
					? Number(targetFolderId.replace("F-", ""))
					: null,
			})
		}
	}

	const handleRename = (id: string) => {
		// TODO: Implement rename functionality
		console.log("Rename item:", id)
	}

	const handleDelete = (id: string) => {
		// TODO: Implement delete functionality
		console.log("Delete item:", id)
	}

	if (isLoading) {
		return <div className="h-screen p-8">Loading...</div>
	}

	const treeItems = buildTreeItems(templates || [])

	return (
		<div className="h-screen p-4">
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}>
				<PanelGroup
					autoSaveId="email-client-layout"
					direction="horizontal"
					className="h-full rounded-xl">
					<Panel
						defaultSize={20}
						minSize={18}
						maxSize={30}
						className="rounded-xl shadow-xl border-white border-2 my-1">
						<div className="h-full bg-gray-50">
							<div
								id="folder-tree-container"
								className="h-full p-4">
								<div className="flex justify-between items-center mb-4">
									<h2 className="text-lg font-semibold">
										Email Templates
									</h2>
									<NewTemplateDialog />
								</div>
								<div className="h-[calc(100%-3rem)]">
									<FolderTree
										items={treeItems}
										selectedId={selectedTemplate}
										onSelect={(id) =>
											setSelectedTemplate(id)
										}
										onDrop={handleDrop}
										onRename={handleRename}
										onDelete={handleDelete}
									/>
								</div>
							</div>
						</div>
					</Panel>
					<PanelResizeHandle className="w-1 translate-x-0 hover:-translate-x-2 my-4 rounded-full hover:bg-blue-500/20 transition-all ease-in-out duration-300 relative">
						<div className="h-full flex items-center justify-center absolute opacity-0 hover:opacity-100 transition-opacity duration-300">
							<DragHandleDots2Icon className="h-8 w-4 text-gray-400 bg-white dark:bg-black rounded-full w-fit -translate-x-1.5 border border-gray-200" />
						</div>
					</PanelResizeHandle>
					<Panel defaultSize={80}>
						<div className="h-full">
							<DndEditorProvider
								components={components}
								addComponent={handleAddComponent}>
								<Tabs
									defaultValue="code"
									className="h-full flex flex-col"
									onValueChange={setActiveTab}>
									<div className="flex items-center px-4 py-2 border-b shrink-0">
										<TabsList>
											<TabsTrigger value="code">
												Code
											</TabsTrigger>
											<TabsTrigger value="preview">
												Preview
											</TabsTrigger>
											<TabsTrigger value="editor">
												Visual Editor
											</TabsTrigger>
										</TabsList>
									</div>
									<div className="flex grow h-[calc(100%-53px)]">
										<div className="flex-1 h-full">
											<TabsContent
												value="code"
												className="h-full m-0 p-0">
												<CodeEditor
													templateId={
														selectedTemplate
															? Number(
																	selectedTemplate.replace(
																		"T-",
																		""
																	)
															  )
															: null
													}
												/>
											</TabsContent>
											<TabsContent
												value="preview"
												className="h-full m-0 p-0">
												<Preview />
											</TabsContent>
											<TabsContent
												value="editor"
												className="h-full m-0 p-0">
												<DndEditor />
											</TabsContent>
										</div>
										{activeTab === "editor" && (
											<div className="w-64 border-l h-full">
												<ComponentPalette
													onAddComponent={
														handleAddComponent
													}
												/>
											</div>
										)}
									</div>
								</Tabs>
							</DndEditorProvider>
						</div>
					</Panel>
				</PanelGroup>
				<DragOverlay>
					{activeItem ? (
						<div className="flex items-center gap-2 px-4 py-2 bg-white shadow-lg rounded-md border border-gray-200">
							{activeItem.type === "folder" ? (
								<Folder size={16} className="text-gray-500" />
							) : (
								<FileText size={16} className="text-gray-500" />
							)}
							<span className="text-sm font-medium">
								{activeItem.name}
							</span>
						</div>
					) : null}
				</DragOverlay>
			</DndContext>
		</div>
	)
}
