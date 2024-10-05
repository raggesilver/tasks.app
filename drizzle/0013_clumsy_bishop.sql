DROP INDEX IF EXISTS "workspaces_slug_index";--> statement-breakpoint
ALTER TABLE "workspaces" DROP COLUMN IF EXISTS "slug";