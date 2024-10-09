ALTER TABLE "workspaces" RENAME TO "boards";--> statement-breakpoint
ALTER TABLE "attachments" RENAME COLUMN "workspace_id" TO "board_id";--> statement-breakpoint
ALTER TABLE "collaborators" RENAME COLUMN "workspace_id" TO "board_id";--> statement-breakpoint
ALTER TABLE "invitation_links" RENAME COLUMN "workspace_id" TO "board_id";--> statement-breakpoint
ALTER TABLE "labels" RENAME COLUMN "workspace_id" TO "board_id";--> statement-breakpoint
ALTER TABLE "status_columns" RENAME COLUMN "workspace_id" TO "board_id";--> statement-breakpoint
ALTER TABLE "tasks" RENAME COLUMN "workspace_id" TO "board_id";--> statement-breakpoint
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_workspace_id_workspaces_id_fk";
--> statement-breakpoint
ALTER TABLE "collaborators" DROP CONSTRAINT "collaborators_workspace_id_workspaces_id_fk";
--> statement-breakpoint
ALTER TABLE "invitation_links" DROP CONSTRAINT "invitation_links_workspace_id_workspaces_id_fk";
--> statement-breakpoint
ALTER TABLE "labels" DROP CONSTRAINT "labels_workspace_id_workspaces_id_fk";
--> statement-breakpoint
ALTER TABLE "status_columns" DROP CONSTRAINT "status_columns_workspace_id_workspaces_id_fk";
--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_workspace_id_workspaces_id_fk";
--> statement-breakpoint
ALTER TABLE "boards" DROP CONSTRAINT "workspaces_owner_id_users_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "collaborators_workspace_id_user_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "invitation_links_workspace_id_active_index";--> statement-breakpoint
DROP INDEX IF EXISTS "status_columns_workspace_id_name_index";--> statement-breakpoint
ALTER TABLE "collaborators" DROP CONSTRAINT "collaborators_workspace_id_user_id_pk";--> statement-breakpoint
ALTER TABLE "collaborators" ADD CONSTRAINT "collaborators_board_id_user_id_pk" PRIMARY KEY("board_id","user_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attachments" ADD CONSTRAINT "attachments_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collaborators" ADD CONSTRAINT "collaborators_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invitation_links" ADD CONSTRAINT "invitation_links_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "labels" ADD CONSTRAINT "labels_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "status_columns" ADD CONSTRAINT "status_columns_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "boards" ADD CONSTRAINT "boards_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "collaborators_board_id_user_id_index" ON "collaborators" USING btree ("board_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "invitation_links_board_id_active_index" ON "invitation_links" USING btree ("board_id","active") WHERE "invitation_links"."active" = true;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "status_columns_board_id_name_index" ON "status_columns" USING btree ("board_id","name");