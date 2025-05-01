import React from "react"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { useState } from "react"
import { trpc } from "@/lib/trpc"

interface NewTemplateDialogProps {
	parentFolderId?: number | null
}

export function NewTemplateDialog({ parentFolderId }: NewTemplateDialogProps) {
	const [open, setOpen] = useState(false)
	const [type, setType] = useState<"template" | "folder">("template")
	const [name, setName] = useState("")
	const [description, setDescription] = useState("")

	const utils = trpc.useContext()
	const { mutate: createTemplate } = trpc.email.createTemplate.useMutation({
		onSuccess: () => {
			utils.email.getTemplates.invalidate()
			setOpen(false)
			setName("")
			setDescription("")
		},
	})

	const { mutate: createFolder } = trpc.email.createFolder.useMutation({
		onSuccess: () => {
			utils.email.getTemplates.invalidate()
			setOpen(false)
			setName("")
			setDescription("")
		},
	})

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!name.trim()) return

		if (type === "template") {
			createTemplate({
				name,
				description,
				folderId: parentFolderId,
				content: "",
				subject: "",
			})
		} else {
			createFolder({
				name,
				description,
				parentFolderId,
			})
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm" variant="outline">
					<Plus className="w-4 h-4 mr-1" />
					New
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New</DialogTitle>
					<DialogDescription>
						Add a new email template or folder to organize your
						templates.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="type">Type</Label>
						<Select
							value={type}
							onValueChange={(value: "template" | "folder") =>
								setType(value)
							}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="template">
									Template
								</SelectItem>
								<SelectItem value="folder">Folder</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder={`${
								type === "template" ? "Template" : "Folder"
							} name`}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="description">
							Description (optional)
						</Label>
						<Input
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Brief description"
						/>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button type="submit">Create</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
