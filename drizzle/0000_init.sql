CREATE TABLE "kb_sources" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"owner" text NOT NULL,
	"trust_tier" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"fetch_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"last_checked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kb_sources_url_unique" UNIQUE("url"),
	CONSTRAINT "kb_sources_kind_check" CHECK ("kb_sources"."kind" in ('docs', 'changelog', 'repo', 'blog')),
	CONSTRAINT "kb_sources_trust_tier_check" CHECK ("kb_sources"."trust_tier" in ('official', 'community'))
);
--> statement-breakpoint
CREATE TABLE "progress" (
	"user_id" text NOT NULL,
	"exercise_id" text NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "progress_user_id_exercise_id_pk" PRIMARY KEY("user_id","exercise_id")
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "submissions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"exercise_id" text NOT NULL,
	"payload" jsonb NOT NULL,
	"passed" boolean,
	"results" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"graded_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"hero_name" text NOT NULL,
	"track" text NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"streak" integer DEFAULT 0 NOT NULL,
	"last_active_at" timestamp with time zone,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_track_check" CHECK ("users"."track" in ('builder', 'strategist')),
	CONSTRAINT "users_xp_check" CHECK ("users"."xp" >= 0),
	CONSTRAINT "users_streak_check" CHECK ("users"."streak" >= 0)
);
--> statement-breakpoint
CREATE TABLE "xp_events" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "xp_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"amount" integer NOT NULL,
	"reason" text NOT NULL,
	"exercise_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "progress" ADD CONSTRAINT "progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "submissions_user_exercise_idx" ON "submissions" USING btree ("user_id","exercise_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "users_xp_idx" ON "users" USING btree ("xp" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "xp_events_award_once_idx" ON "xp_events" USING btree ("user_id","exercise_id","reason") WHERE "xp_events"."exercise_id" is not null;--> statement-breakpoint
CREATE INDEX "xp_events_created_at_idx" ON "xp_events" USING btree ("created_at");