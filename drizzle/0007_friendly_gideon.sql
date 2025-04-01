CREATE TYPE "public"."privacy" AS ENUM('public', 'private');--> statement-breakpoint
ALTER TABLE "post" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "privacy" "privacy" DEFAULT 'public';--> statement-breakpoint
CREATE POLICY "policy" ON "post" AS PERMISSIVE FOR SELECT TO public USING (privacy = 'public' OR (privacy = 'private' AND userId = current_user_id())) WITH CHECK (privacy = 'public' OR (privacy = 'private' AND userId = current_user_id()));