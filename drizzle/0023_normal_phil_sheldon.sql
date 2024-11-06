CREATE TABLE IF NOT EXISTS "workspace_collaborators" (
	"workspace_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "workspace_collaborators_workspace_id_user_id_pk" PRIMARY KEY("workspace_id","user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workspace_collaborators" ADD CONSTRAINT "workspace_collaborators_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workspace_collaborators" ADD CONSTRAINT "workspace_collaborators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
