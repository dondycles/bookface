import { authMiddleware } from "@/lib/middleware/auth-guard";
import { notification } from "@/lib/schema";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
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
      commentId?: string;
      likeId?: string;
    }) => data,
  )
  .handler(
    async ({
      data: { receiverId, type, postId, friendshipId, commentId, likeId },
      context: { dB: user },
    }) => {
      if (!user.id) throw new Error(`[{ "message": "No User ID." }]`);
      await db.insert(notification).values({
        notifierId: user.id,
        type,
        receiverId,
        postId,
        friendshipId,
        commentId,
        likeId,
      });
      await pusher.trigger(receiverId, "notification", null);
    },
  );

export const getCurrentUserNotifications = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware])
  .handler(async ({ context: { dB: user } }) => {
    if (!user.id) throw new Error(`[{ "message": "No User ID." }]`);
    return await db.query.notification.findMany({
      orderBy: (notification, { desc }) => desc(notification.createdAt),
      where: (notification, { eq }) => eq(notification.receiverId, user.id),
      with: {
        notifierData: true,
      },
      limit: 10,
      extras: ({ likeId, commentId }, { sql }) => ({
        commentData: sql<{
          postId: string;
          message: string;
        }>`(SELECT "postId, message" FROM "postComments" WHERE "id" = ${commentId})`.as(
          "commentData",
        ),
        likePostId:
          sql<string>`(SELECT "postId" FROM "postLikes" WHERE "id" = ${likeId})`.as(
            "likePostId",
          ),
      }),
    });
  });

export const readNotification = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ context: { dB: user }, data: { id } }) => {
    if (!user.id) throw new Error(`[{ "message": "No User ID." }]`);
    await db
      .update(notification)
      .set({
        isRead: true,
      })
      .where(eq(notification.id, id));
  });
