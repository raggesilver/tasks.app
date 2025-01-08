-- Custom SQL migration file, put you code below! --
ALTER TABLE "status_columns" ADD CONSTRAINT "status_columns_board_id_order_constraint" UNIQUE ("board_id", "order") DEFERRABLE INITIALLY DEFERRED;
