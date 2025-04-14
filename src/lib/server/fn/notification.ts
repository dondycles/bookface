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
      commentMessage?: string;
    }) => data,
  )
  .handler(
    async ({
      data: { receiverId, type, postId, friendshipId, commentId, likeId, commentMessage },
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
      if (receiverId !== user.id)
        await pusher.trigger(receiverId, "notification", {
          type,
          notifierId: user.id,
          postId,
          friendshipId,
          commentId,
          likeId,
          notifierUsername: user.username ?? user.name,
          commentMessage,
        });
    },
  );

export const getCurrentUserNotifications = createServerFn({
  method: "GET",
})
  .validator((data: { pageParam: number }) => data)
  .middleware([authMiddleware])
  .handler(async ({ context: { dB: user }, data }) => {
    if (!user.id) throw new Error(`[{ "message": "No User ID." }]`);
    return await db.query.notification.findMany({
      orderBy: (notification, { desc }) => desc(notification.createdAt),
      where: (notification, { eq, ne, and }) =>
        and(eq(notification.receiverId, user.id), ne(notification.notifierId, user.id)),
      with: {
        notifierData: true,
      },
      limit: 10,
      offset: data.pageParam * 10,
      extras: ({ likeId, commentId }, { sql }) => ({
        commentPostId:
          sql<string>`(SELECT "postId" FROM "postComments" WHERE "id" = ${commentId})`.as(
            "commentPostId",
          ),
        commentMessage:
          sql<string>`(SELECT "message" FROM "postComments" WHERE "id" = ${commentId})`.as(
            "commentMessage",
          ),
        likePostId:
          sql<string>`(SELECT "postId" FROM "postLikes" WHERE "id" = ${likeId})`.as(
            "likePostId",
          ),
      }),
    });
  });

export type Notification = Awaited<ReturnType<typeof getCurrentUserNotifications>>;

export const readNotification = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator((data: { ids: [string] }) => data)
  .handler(async ({ context: { dB: user }, data: { ids } }) => {
    if (!user.id) throw new Error(`[{ "message": "No User ID." }]`);
    await db.transaction(async (tx) => {
      for (const id of ids) {
        await tx
          .update(notification)
          .set({
            isRead: true,
          })
          .where(eq(notification.id, id));
      }
    });
  });
