ALTER TABLE "submissions" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "sandbox_day" date;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "run_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "submit_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "sandbox_pending_at" timestamp with time zone;--> statement-breakpoint
UPDATE "submissions" SET "status" = CASE WHEN "passed" THEN 'passed' WHEN "passed" = false THEN 'failed' ELSE 'pending' END;--> statement-breakpoint
ALTER TABLE "submissions" DROP COLUMN "passed";--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_status_check" CHECK ("submissions"."status" in ('pending', 'passed', 'failed', 'errored'));--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_graded_check" CHECK (("submissions"."status" = 'pending') = ("submissions"."graded_at" is null));--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_run_count_check" CHECK ("users"."run_count" >= 0);--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_submit_count_check" CHECK ("users"."submit_count" >= 0);