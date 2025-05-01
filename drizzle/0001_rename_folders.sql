CREATE TABLE IF NOT EXISTS "email_template_folders" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"parent_id" integer REFERENCES "email_template_folders"("id"),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Copy data from old table to new table
INSERT INTO "email_template_folders" ("id", "name", "description", "parent_id", "created_at", "updated_at")
SELECT "id", "name", "description", "parent_id", "created_at", "updated_at"
FROM "folders";

-- Update foreign key references in email_templates table
ALTER TABLE "email_templates" ADD COLUMN "folder_id" integer REFERENCES "email_template_folders"("id");
UPDATE "email_templates" SET "folder_id" = "folder_id";

-- Drop old table
DROP TABLE "folders"; 