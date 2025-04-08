CREATE TYPE "public"."status" AS ENUM('accepted', 'pending');--> statement-breakpoint
CREATE TYPE "public"."state" AS ENUM('seen', 'delivered');--> statement-breakpoint
CREATE TABLE "friendship" (
	"id" text PRIMARY KEY NOT NULL,
	"requester" text NOT NULL,
	"receiver" text NOT NULL,
	"status" "status" DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "chat" (
	"id" text PRIMARY KEY NOT NULL,
	"people" text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"roomId" text NOT NULL,
	"message" text NOT NULL,
	"senderId" text NOT NULL,
	"receiverId" text NOT NULL,
	"state" "state" DEFAULT 'delivered'
);
--> statement-breakpoint
CREATE TABLE "chatRoom" (
	"id" text PRIMARY KEY NOT NULL,
	"people" text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "post" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "friendship" ADD CONSTRAINT "friendship_requester_user_id_fk" FOREIGN KEY ("requester") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendship" ADD CONSTRAINT "friendship_receiver_user_id_fk" FOREIGN KEY ("receiver") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat" ADD CONSTRAINT "chat_roomId_chatRoom_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."chatRoom"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat" ADD CONSTRAINT "chat_senderId_user_id_fk" FOREIGN KEY ("senderId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat" ADD CONSTRAINT "chat_receiverId_user_id_fk" FOREIGN KEY ("receiverId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
DROP POLICY "policy" ON "post" CASCADE;