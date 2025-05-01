import { z } from "zod"
import { router, publicProcedure } from "../trpc"
import { db } from "@/db"
import {
	emailTemplates,
	emailTemplateFolders,
	type EmailTemplate,
	type EmailTemplateFolder,
} from "@/db/schema"
import { eq } from "drizzle-orm"
import { render } from "@react-email/render"
import { resend } from "@/lib/resend"

type FolderWithChildren = EmailTemplateFolder & {
	children: FolderWithChildren[]
	templates: EmailTemplate[]
}

export const emailRouter = router({
	createTemplate: publicProcedure
		.input(
			z.object({
				name: z.string(),
				description: z.string().optional(),
				subject: z.string(),
				content: z.string(),
				variables: z.record(z.string()).optional(),
				folderId: z.number().nullable().optional(),
			})
		)
		.mutation(async ({ input }) => {
			const { name, description, subject, content, variables, folderId } =
				input
			return await db.insert(emailTemplates).values({
				name,
				description,
				subject,
				content,
				variables: variables || {},
				folderId,
			})
		}),

	createFolder: publicProcedure
		.input(
			z.object({
				name: z.string(),
				description: z.string().optional(),
				parentFolderId: z.number().nullable().optional(),
			})
		)
		.mutation(async ({ input }) => {
			const { name, description, parentFolderId } = input
			return await db.insert(emailTemplateFolders).values({
				name,
				description,
				parentId: parentFolderId,
			})
		}),

	getTemplates: publicProcedure.query(async () => {
		const [templatesResult, foldersResult] = await Promise.all([
			db.select().from(emailTemplates),
			db.select().from(emailTemplateFolders),
		])

		// Build folder tree
		const folderMap = new Map<number, FolderWithChildren>(
			foldersResult.map((f) => [
				f.id,
				{
					...f,
					children: [] as FolderWithChildren[],
					templates: [] as EmailTemplate[],
				} as FolderWithChildren,
			])
		)
		const rootItems: (FolderWithChildren | EmailTemplate)[] = []

		// Organize folders into tree
		foldersResult.forEach((folder) => {
			const folderWithChildren = folderMap.get(folder.id)!
			if (folder.parentId === null) {
				rootItems.push(folderWithChildren)
			} else {
				const parent = folderMap.get(folder.parentId)
				if (parent) {
					parent.children.push(folderWithChildren)
				}
			}
		})

		// Add templates to their folders
		templatesResult.forEach((template) => {
			if (template.folderId === null) {
				rootItems.push(template)
			} else {
				const folder = folderMap.get(template.folderId)
				if (folder) {
					folder.templates.push(template)
				}
			}
		})

		return rootItems
	}),

	getTemplateById: publicProcedure
		.input(z.number())
		.query(async ({ input }) => {
			const [template] = await db
				.select()
				.from(emailTemplates)
				.where(eq(emailTemplates.id, input))
			return template
		}),

	updateTemplate: publicProcedure
		.input(
			z.object({
				id: z.number(),
				name: z.string().optional(),
				description: z.string().optional(),
				subject: z.string().optional(),
				content: z.string().optional(),
				variables: z.record(z.string()).optional(),
				folderId: z.number().nullable().optional(),
			})
		)
		.mutation(async ({ input }) => {
			const { id, ...updateData } = input
			return await db
				.update(emailTemplates)
				.set(updateData)
				.where(eq(emailTemplates.id, id))
		}),

	deleteTemplate: publicProcedure
		.input(z.number())
		.mutation(async ({ input }) => {
			await db.delete(emailTemplates).where(eq(emailTemplates.id, input))
		}),

	deleteFolder: publicProcedure
		.input(z.number())
		.mutation(async ({ input }) => {
			// First, recursively delete all subfolders and their contents
			const folder = await db
				.select()
				.from(emailTemplateFolders)
				.where(eq(emailTemplateFolders.id, input))
				.then((rows) => rows[0])

			if (!folder) return

			// Get all subfolders
			const subfolders = await db
				.select()
				.from(emailTemplateFolders)
				.where(eq(emailTemplateFolders.parentId, input))

			// Recursively delete subfolders
			await Promise.all(
				subfolders.map((subfolder) =>
					db
						.delete(emailTemplateFolders)
						.where(eq(emailTemplateFolders.id, subfolder.id))
				)
			)

			// Delete all templates in this folder
			await db
				.delete(emailTemplates)
				.where(eq(emailTemplates.folderId, input))

			// Finally, delete the folder itself
			await db
				.delete(emailTemplateFolders)
				.where(eq(emailTemplateFolders.id, input))
		}),

	updateFolder: publicProcedure
		.input(
			z.object({
				id: z.number(),
				name: z.string().optional(),
				description: z.string().optional(),
				parentId: z.number().nullable().optional(),
			})
		)
		.mutation(async ({ input }) => {
			const { id, ...updateData } = input
			return await db
				.update(emailTemplateFolders)
				.set(updateData)
				.where(eq(emailTemplateFolders.id, id))
		}),

	renameTemplate: publicProcedure
		.input(
			z.object({
				id: z.number(),
				name: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			const { id, name } = input
			return await db
				.update(emailTemplates)
				.set({ name })
				.where(eq(emailTemplates.id, id))
		}),

	renameFolder: publicProcedure
		.input(
			z.object({
				id: z.number(),
				name: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			const { id, name } = input
			return await db
				.update(emailTemplateFolders)
				.set({ name })
				.where(eq(emailTemplateFolders.id, id))
		}),

	sendEmail: publicProcedure
		.input(
			z.object({
				templateId: z.number(),
				to: z.string(),
				variables: z.record(z.string()),
			})
		)
		.mutation(async ({ input }) => {
			const { templateId, to, variables } = input

			// Get the template
			const template = await db
				.select()
				.from(emailTemplates)
				.where(eq(emailTemplates.id, templateId))
				.then((rows) => rows[0])

			if (!template) {
				throw new Error("Template not found")
			}

			// Replace variables in the content
			let content = template.content
			Object.entries(variables).forEach(([key, value]) => {
				content = content.replace(new RegExp(`{${key}}`, "g"), value)
			})

			// Send the email using Resend
			const result = await resend.emails.send({
				from: "onboarding@resend.dev",
				to: [to],
				subject: template.subject,
				html: content,
			})

			return result
		}),
})
