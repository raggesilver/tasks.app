DROP INDEX IF EXISTS "invitation_links_board_id_active_index";--> statement-breakpoint
ALTER TABLE "invitation_links" ALTER COLUMN "board_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "invitation_links" ADD COLUMN "workspace_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invitation_links" ADD CONSTRAINT "invitation_links_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "invitation_links_workspace_id_active_index" ON "invitation_links" USING btree ("workspace_id","active") WHERE "invitation_links"."active" = true AND "invitation_links"."workspace_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "invitation_links_board_id_active_index" ON "invitation_links" USING btree ("board_id","active") WHERE "invitation_links"."active" = true AND "invitation_links"."board_id" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "invitation_links" ADD CONSTRAINT "valid_invitation_target" CHECK ((
        ("invitation_links"."workspace_id" IS NULL AND "invitation_links"."board_id" IS NOT NULL) OR 
        ("invitation_links"."workspace_id" IS NOT NULL AND "invitation_links"."board_id" IS NULL)
      ));