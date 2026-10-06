DROP INDEX "users_xp_idx";--> statement-breakpoint
CREATE INDEX "users_leaderboard_idx" ON "users" USING btree ("xp" DESC NULLS LAST,"created_at","id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_hero_name_lower_idx" ON "users" USING btree (lower("hero_name"));