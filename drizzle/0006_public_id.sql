ALTER TABLE "users" ADD COLUMN "public_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "users_public_id_idx" ON "users" USING btree ("public_id");