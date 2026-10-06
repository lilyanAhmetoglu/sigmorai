ALTER TABLE "users" DROP CONSTRAINT "users_track_check";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_track_check" CHECK ("users"."track" in ('builder', 'strategist', 'creator'));