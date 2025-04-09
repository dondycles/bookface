import { authMiddleware } from "@/lib/middleware/auth-guard";
import { notification } from "@/lib/schema";
import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";
import { pusher } from "../pusher";

export const sendNotification = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator(
    (data: {
      receiverId: string;
      type: typeof notification.$inferInsert.type;
      postId?: string;
      friendshipId?: string;
    }) => data,
  )
  .handler(
    async ({
      data: { receiverId, type, postId, friendshipId },
      context: { dB: user },
    }) => {
      if (!user.id) throw new Error(`[{ "message": "No User ID." }]`);
      await db.insert(notification).values({
        notifierId: user.id,
        type,
        receiverId,
        postId,
        friendshipId,
      });
      await pusher.trigger(receiverId, "notification", null);
    },
  );
