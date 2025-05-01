import {
	pgTable,
	serial,
	text,
	timestamp,
	integer,
	jsonb,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import type { InferModel } from "drizzle-orm"

// @ts-expect-error: Self-referential tables require circular type references
export const emailTemplateFolders = pgTable("email_template_folders", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	// @ts-expect-error: Self-referential tables require circular type references
	parentId: integer("parent_id").references(() => emailTemplateFolders.id),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
})

export const emailTemplates = pgTable("email_templates", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	subject: text("subject").notNull(),
	content: text("content").notNull(), // This will store the JSX-like content as a string
	variables: jsonb("variables").$type<Record<string, string>>(),
	folderId: integer("folder_id").references(() => emailTemplateFolders.id),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
})

export const emailTemplateFoldersRelations = relations(
	emailTemplateFolders,
	({ one, many }) => ({
		parent: one(emailTemplateFolders, {
			fields: [emailTemplateFolders.parentId],
			references: [emailTemplateFolders.id],
		}),
		children: many(emailTemplateFolders),
		templates: many(emailTemplates),
	})
)

export const emailTemplatesRelations = relations(emailTemplates, ({ one }) => ({
	folder: one(emailTemplateFolders, {
		fields: [emailTemplates.folderId],
		references: [emailTemplateFolders.id],
	}),
}))

// Types
export type EmailTemplate = typeof emailTemplates.$inferSelect
export type NewEmailTemplate = typeof emailTemplates.$inferInsert
export type EmailTemplateFolder = typeof emailTemplateFolders.$inferSelect
export type NewEmailTemplateFolder = typeof emailTemplateFolders.$inferInsert
