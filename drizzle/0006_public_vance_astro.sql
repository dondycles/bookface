ALTER TABLE "username" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "username" CASCADE;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "displayUsername";--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_username_unique" UNIQUE("username");