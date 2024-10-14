-- Insert a new workspace named 'Personal' for each user
INSERT INTO "workspaces" ("name", "owner_id") SELECT DISTINCT 'Personal', "id" FROM "users" WHERE NOT EXISTS (
  SELECT 1
  FROM "workspaces"
  WHERE "workspaces"."owner_id" = "users"."id"
  AND "workspaces"."name" = 'Personal'
); --> statement-breakpoint

-- Set the workspace_id for each board
UPDATE "boards" SET "workspace_id" = "workspaces"."id" FROM "workspaces" WHERE "boards"."owner_id" = "workspaces"."owner_id" AND "boards"."workspace_id" IS NULL; --> statement-breakpoint

-- Set the workspace_id for each status column
UPDATE "status_columns" SET "workspace_id" = "boards"."workspace_id" FROM "boards" WHERE "boards"."id" = "status_columns"."board_id" AND "status_columns"."workspace_id" IS NULL; --> statement-breakpoint
