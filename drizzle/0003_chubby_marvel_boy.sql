DROP INDEX IF EXISTS "status_columns_workspace_id_order_index";--> statement-breakpoint
DROP INDEX IF EXISTS "collaborators_workspace_id_user_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "oauth_provider_user_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "status_columns_workspace_id_name_index";--> statement-breakpoint
DROP INDEX IF EXISTS "users_email_index";--> statement-breakpoint
DROP INDEX IF EXISTS "workspaces_slug_index";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "collaborators_workspace_id_user_id_index" ON "collaborators" USING btree (workspace_id,user_id);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "oauth_provider_user_id_index" ON "oauth" USING btree (provider,user_id);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "status_columns_workspace_id_name_index" ON "status_columns" USING btree (workspace_id,name);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_index" ON "users" USING btree (email);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "workspaces_slug_index" ON "workspaces" USING btree (slug);