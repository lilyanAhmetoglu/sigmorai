ALTER TABLE "submissions" DROP CONSTRAINT "submissions_graded_check";--> statement-breakpoint
ALTER TABLE "submissions" DROP CONSTRAINT "submissions_status_check";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_run_count_check";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_submit_count_check";--> statement-breakpoint
ALTER TABLE "submissions" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
DELETE FROM "submissions" WHERE "status" IN ('pending', 'errored');--> statement-breakpoint
ALTER TABLE "submissions" ALTER COLUMN "results" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" DROP COLUMN "graded_at";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "sandbox_day";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "run_count";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "submit_count";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "sandbox_pending_at";--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_status_check" CHECK ("submissions"."status" in ('passed', 'failed'));