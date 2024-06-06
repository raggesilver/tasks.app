-- Custom SQL migration file, put you code below! --
ALTER TABLE "status_columns" ADD CONSTRAINT "status_columns_workspace_id_order_constraint" UNIQUE (workspace_id, "order") DEFERRABLE INITIALLY DEFERRED;
