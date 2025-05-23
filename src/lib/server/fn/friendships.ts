import { authMiddleware } from "@/lib/middleware/auth-guard";
import { friendship, notification } from "@/lib/schema";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { pusher } from "../pusher";
import { createOrGetChatRoomId } from "./messages";
import { sendNotification } from "./notification";
const friendSchema = z.object({
  receiverId: z.string(),
});

export const checkFriendshipStatus = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware])
  .validator(
    (data: { recieverId: string; requesterId: string; friendshipId: string }) => data,
  )
  .handler(
    async ({
      data: { recieverId, requesterId, friendshipId },
      context: { dB: user },
    }) => {
      if (!user.id) throw new Error(`[{ "message": "No User ID." }]`);
      return await db.query.friendship.findFirst({
        where: (friendship, { or, eq }) =>
          or(
            or(
              eq(friendship.id, `${recieverId}${requesterId}`),
              eq(friendship.id, `${requesterId}${recieverId}`),
            ),
            eq(friendship.id, friendshipId),
          ),
        columns: { status: true },
      });
    },
  );

export const addFriendshipRequest = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator(friendSchema)
  .handler(async ({ data, context: { dB: user } }) => {
    if (!user.id) throw new Error(`[{ "message": "No User ID." }]`);
    const status = await checkFriendshipStatus({
      data: { recieverId: data.receiverId, requesterId: user.id, friendshipId: "" },
    });

    if (!status) {
      const friendshipData = await db
        .insert(friendship)
        .values({
          requester: user.id,
          receiver: data.receiverId,
          id: `${user.id}${data.receiverId}`,
          status: "pending",
        })
        .returning({ id: friendship.id });

      await sendNotification({
        data: {
          receiverId: data.receiverId,
          type: "addfriendship",
          friendshipId: friendshipData[0].id,
        },
      });
    } else if (status.status === "pending")
      throw new Error(`[{ "message": "Already Pending." }]`);
  });

export const removeFriendship = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator((data: { friendshipId: string; targetedUserId: string }) => data)
  .handler(async ({ data: { friendshipId, targetedUserId }, context: { dB: user } }) => {
    if (!user.id) throw new Error(`[{ "message": "No User ID." }]`);

    const status = await checkFriendshipStatus({
      data: { recieverId: "", requesterId: "", friendshipId },
    });
    if (!status) throw new Error(`[{ "message": "Request First." }]`);
    await db.delete(friendship).where(eq(friendship.id, friendshipId));
    await pusher.trigger(targetedUserId, "notification", null);
  });

export const acceptFriendshipRequest = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator((data: { friendshipId: string; targetedUserId: string }) => data)
  .handler(async ({ data: { friendshipId, targetedUserId }, context: { dB: user } }) => {
    if (!user.id) throw new Error(`[{ "message": "No User ID." }]`);
    const status = await checkFriendshipStatus({
      data: { recieverId: "", requesterId: "", friendshipId },
    });
    if (!status) throw new Error(`[{ "message": "Request First." }]`);
    if (status.status === "accepted")
      throw new Error(`[{ "message": "Already Friend." }]`);
    await db
      .update(friendship)
      .set({
        status: "accepted",
        acceptedAt: new Date(),
      })
      .where(eq(friendship.id, friendshipId));
    await db.insert(notification).values({
      notifierId: user.id,
      receiverId: targetedUserId,
      type: "acceptedfriendship",
      friendshipId,
    });
    const chatRoomId = await createOrGetChatRoomId({
      data: { receiverId: targetedUserId },
    });
    if (chatRoomId) throw redirect({ to: "/m/$id", params: { id: chatRoomId } });
  });
export const getCurrentUserFriendships = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware])
  .handler(async ({ context: { dB: user } }) => {
    if (!user.id) throw new Error(`[{ "message": "No User ID." }]`);

    return await db.query.friendship.findMany({
      where: (friendship, { or }) =>
        or(eq(friendship.receiver, user.id), eq(friendship.requester, user.id)),
      with: { receiverInfo: true, requesterInfo: true },
    });
  });

export type Friendships = NonNullable<
  Awaited<ReturnType<typeof getCurrentUserFriendships>>
>;

export const getThisUserAcceptedFriendships = createServerFn({
  method: "GET",
})
  .validator((username: string) => username)
  .handler(async ({ data: username }) => {
    if (!username) throw new Error(`[{ "message": "No Username." }]`);

    const userId = await db.query.user.findFirst({
      where: (user, { eq }) => eq(user.username, username),
      columns: {
        id: true,
      },
    });
    if (!userId) throw new Error(`[{ "message": "No User Id." }]`);

    return await db.query.friendship.findMany({
      where: (friendship, { or, and }) =>
        and(
          or(eq(friendship.receiver, userId.id), eq(friendship.requester, userId.id)),
          eq(friendship.status, "accepted"),
        ),
      with: { receiverInfo: true, requesterInfo: true },
    });
  });
export const getThisFriendship = createServerFn({
  method: "GET",
})
  .validator((data: { userId: string; currentUserId: string }) => data)
  .handler(async ({ data: { userId, currentUserId } }) => {
    return await db.query.friendship.findFirst({
      where: (friendship, { or }) =>
        or(
          eq(friendship.id, `${userId}${currentUserId}`),
          eq(friendship.id, `${currentUserId}${userId}`),
        ),
    });
  });
