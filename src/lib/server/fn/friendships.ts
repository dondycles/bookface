import { authMiddleware } from "@/lib/middleware/auth-guard";
import { friendship } from "@/lib/schema";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { pusher } from "../pusher";

const friendSchema = z.object({
  receiverId: z.string(),
});

export const addFriendshipRequest = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator(friendSchema)
  .handler(async ({ data, context: { dB: user } }) => {
    if (!user.id) throw new Error(`[{ "message": "No User ID." }]`);

    const friendshipData = await db
      .insert(friendship)
      .values({
        requester: user.id,
        receiver: data.receiverId,
        id: `${user.id}${data.receiverId}`,
        status: "pending",
      })
      .returning();
    pusher.trigger(friendshipData[0].id, data.receiverId, friendshipData[0].id);
  });
export const removeFriendship = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator((data: { friendshipId: string; updateReceiverId: string }) => data)
  .handler(
    async ({ data: { friendshipId, updateReceiverId }, context: { dB: user } }) => {
      if (!user.id) throw new Error(`[{ "message": "No User ID." }]`);
      await db.delete(friendship).where(eq(friendship.id, friendshipId));
      pusher.trigger(friendshipId, updateReceiverId, friendshipId);
    },
  );
export const acceptFriendshipRequest = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator((data: { friendshipId: string; updateReceiverId: string }) => data)
  .handler(
    async ({ data: { friendshipId, updateReceiverId }, context: { dB: user } }) => {
      if (!user.id) throw new Error(`[{ "message": "No User ID." }]`);
      await db
        .update(friendship)
        .set({
          status: "accepted",
          acceptedAt: new Date(),
        })
        .where(eq(friendship.id, friendshipId));
      pusher.trigger(friendshipId, updateReceiverId, friendshipId);
    },
  );
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
