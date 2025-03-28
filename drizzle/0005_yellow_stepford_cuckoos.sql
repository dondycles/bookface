CREATE TABLE "username" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"userName" text,
	CONSTRAINT "username_userName_unique" UNIQUE("userName")
);
--> statement-breakpoint
CREATE TABLE "postComments" (
	"id" text PRIMARY KEY NOT NULL,
	"postId" text NOT NULL,
	"commenterId" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "postLikes" (
	"id" text PRIMARY KEY NOT NULL,
	"postId" text NOT NULL,
	"likerId" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "displayUsername" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "username" ADD CONSTRAINT "username_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postComments" ADD CONSTRAINT "postComments_postId_post_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postComments" ADD CONSTRAINT "postComments_commenterId_user_id_fk" FOREIGN KEY ("commenterId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postLikes" ADD CONSTRAINT "postLikes_postId_post_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postLikes" ADD CONSTRAINT "postLikes_likerId_user_id_fk" FOREIGN KEY ("likerId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;