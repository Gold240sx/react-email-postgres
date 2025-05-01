import { useState, useEffect } from "react"
import { trpc } from "@/lib/trpc"
import type { EmailTemplate } from "@/db/schema"
import { render } from "@react-email/render"
import * as React from "react"
import { toast } from "sonner"
import {
	Html,
	Head,
	Body,
	Container,
	Section,
	Text,
	Button as EmailButton,
	Hr,
} from "@react-email/components"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface TemplateEditorProps {
	templateId: number
}

type FormData = {
	name?: string
	description?: string
	subject?: string
	content?: string
	variables?: Record<string, string>
}

type Tab = "code" | "preview"

export function TemplateEditor({ templateId }: TemplateEditorProps) {
	const [formData, setFormData] = useState<FormData>({})
	const [activeTab, setActiveTab] = useState<Tab>("code")
	const [testEmail, setTestEmail] = useState("")
	const [testVariables, setTestVariables] = useState<Record<string, string>>(
		{}
	)
	const [dialogOpen, setDialogOpen] = useState(false)
	const utils = trpc.useContext()

	const { data: template, isLoading } =
		trpc.email.getTemplateById.useQuery(templateId)
	const { mutate: updateTemplate } = trpc.email.updateTemplate.useMutation({
		onSuccess: () => {
			utils.email.getTemplates.invalidate()
			utils.email.getTemplateById.invalidate(templateId)
			toast.success("Template updated successfully")
		},
		onError: (error) => {
			toast.error(`Failed to update template: ${error.message}`)
		},
	})

	const { mutate: sendEmail } = trpc.email.sendEmail.useMutation({
		onSuccess: () => {
			toast.success("Email sent successfully")
			setDialogOpen(false)
			setTestEmail("")
		},
		onError: (error) => {
			toast.error(`Failed to send email: ${error.message}`)
		},
	})

	useEffect(() => {
		if (template) {
			setFormData({
				name: template.name,
				description: template.description ?? undefined,
				subject: template.subject,
				content: template.content,
				variables: template.variables as Record<string, string>,
			})
		}
	}, [template])

	// Reset test variables when dialog opens
	useEffect(() => {
		if (dialogOpen && formData.variables) {
			setTestVariables(formData.variables)
		}
	}, [dialogOpen, formData.variables])

	if (isLoading) return <div>Loading...</div>
	if (!template) return <div>Template not found</div>

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		updateTemplate({
			id: templateId,
			...formData,
		})
	}

	const handleSendEmail = () => {
		if (!testEmail) {
			toast.error("Please enter an email address")
			return
		}

		if (!formData.content) {
			toast.error("Template content is empty")
			return
		}

		sendEmail({
			templateId,
			to: testEmail,
			variables: testVariables,
		})
	}

	const renderPreview = () => {
		try {
			const variables = formData.variables || {}

			// Create a component directly using the available React Email components
			const EmailPreview = ({
				content,
				variables,
			}: {
				content: string
				variables: Record<string, string>
			}) => {
				let processedContent = content
				// Replace variables in the content
				Object.entries(variables).forEach(([key, value]) => {
					processedContent = processedContent.replace(
						new RegExp(`{${key}}`, "g"),
						value || `{${key}}` // Use placeholder if value is empty
					)
				})

				// Create the component by wrapping the content in a div
				return (
					<Html>
						<Head />
						<Body style={{ fontFamily: "sans-serif" }}>
							<Container>
								<div
									dangerouslySetInnerHTML={{
										__html: processedContent,
									}}
								/>
							</Container>
						</Body>
					</Html>
				)
			}

			// Render the preview
			const html = render(
				<EmailPreview
					content={formData.content || ""}
					variables={variables}
				/>
			)

			return (
				<div className="h-[600px] border rounded">
					<iframe
						srcDoc={html}
						className="w-full h-full"
						title="Email Preview"
					/>
				</div>
			)
		} catch (error) {
			console.error("Preview error:", error)
			return (
				<div className="p-4 text-red-500">
					Error rendering preview. Please check your template code.
				</div>
			)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="flex justify-between items-center border-b border-gray-200">
				<nav className="-mb-px flex">
					<button
						type="button"
						onClick={() => setActiveTab("code")}
						className={`py-2 px-4 border-b-2 font-medium text-sm ${
							activeTab === "code"
								? "border-blue-500 text-blue-600"
								: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
						}`}>
						Code
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("preview")}
						className={`ml-8 py-2 px-4 border-b-2 font-medium text-sm ${
							activeTab === "preview"
								? "border-blue-500 text-blue-600"
								: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
						}`}>
						Preview
					</button>
				</nav>
				<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
					<DialogTrigger asChild>
						<Button variant="outline">Send Test Email</Button>
					</DialogTrigger>
					<DialogContent className="max-w-md">
						<DialogHeader>
							<DialogTitle>Send Test Email</DialogTitle>
							<DialogDescription>
								Enter the email address and customize variables
								for your test email.
							</DialogDescription>
						</DialogHeader>
						<div className="py-4 space-y-4">
							<div className="space-y-2">
								<label className="text-sm font-medium text-gray-700">
									Email Address
								</label>
								<Input
									type="email"
									placeholder="email@example.com"
									value={testEmail}
									onChange={(e) =>
										setTestEmail(e.target.value)
									}
								/>
							</div>

							{Object.keys(formData.variables || {}).length >
								0 && (
								<div className="space-y-4">
									<div className="text-sm font-medium text-gray-700">
										Template Variables
									</div>
									{Object.entries(
										formData.variables || {}
									).map(([key]) => (
										<div key={key} className="space-y-2">
											<label className="text-sm text-gray-600">
												{key}
											</label>
											<Input
												type="text"
												value={testVariables[key] || ""}
												onChange={(e) =>
													setTestVariables({
														...testVariables,
														[key]: e.target.value,
													})
												}
												placeholder={`Value for ${key}`}
											/>
										</div>
									))}
								</div>
							)}
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setDialogOpen(false)}>
								Cancel
							</Button>
							<Button onClick={handleSendEmail}>
								Send Email
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{activeTab === "preview" ? (
				renderPreview()
			) : (
				<>
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Name
						</label>
						<input
							type="text"
							value={formData.name || ""}
							onChange={(e) =>
								setFormData({
									...formData,
									name: e.target.value,
								})
							}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">
							Description
						</label>
						<input
							type="text"
							value={formData.description || ""}
							onChange={(e) =>
								setFormData({
									...formData,
									description: e.target.value,
								})
							}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">
							Subject
						</label>
						<input
							type="text"
							value={formData.subject || ""}
							onChange={(e) =>
								setFormData({
									...formData,
									subject: e.target.value,
								})
							}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">
							Content
						</label>
						<textarea
							value={formData.content || ""}
							onChange={(e) =>
								setFormData({
									...formData,
									content: e.target.value,
								})
							}
							rows={15}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">
							Variables (JSON)
						</label>
						<textarea
							value={
								JSON.stringify(formData.variables, null, 2) ||
								"{}"
							}
							onChange={(e) => {
								try {
									const parsed = JSON.parse(e.target.value)
									setFormData({
										...formData,
										variables: parsed,
									})
								} catch (err) {
									// Invalid JSON, ignore
								}
							}}
							rows={4}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none"
						/>
					</div>

					<div className="flex justify-end space-x-3">
						<button
							type="submit"
							className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none">
							Save Changes
						</button>
					</div>
				</>
			)}
		</form>
	)
}
