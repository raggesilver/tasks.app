ALTER TABLE "attachments" RENAME COLUMN "original_name" TO "name";--> statement-breakpoint
ALTER TABLE "attachments" ADD COLUMN "mime_type" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "attachments" ADD COLUMN "size" integer NOT NULL;