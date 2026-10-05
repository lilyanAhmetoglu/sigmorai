DROP INDEX "xp_events_created_at_idx";--> statement-breakpoint
DROP INDEX "xp_events_award_once_idx";--> statement-breakpoint
ALTER TABLE "xp_events" ALTER COLUMN "exercise_id" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "xp_events_week_idx" ON "xp_events" USING btree ("created_at","user_id","amount");--> statement-breakpoint
CREATE UNIQUE INDEX "xp_events_award_once_idx" ON "xp_events" USING btree ("user_id","exercise_id","reason");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_hero_name_length_check" CHECK (char_length("users"."hero_name") between 2 and 24);--> statement-breakpoint
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_amount_check" CHECK ("xp_events"."amount" > 0);