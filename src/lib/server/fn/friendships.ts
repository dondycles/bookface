import { authMiddleware } from "@/lib/middleware/auth-guard";
import { friendship } from "@/lib/schema";
import { createServerFn } from "@tanstack/react-start";
import { eq, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";

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

    await db.insert(friendship).values({
      requester: user.id,
      receiver: data.receiverId,
      id: `${user.id}${data.receiverId}`,
      status: "pending",
    });
  });
export const removeFriendshipRequest = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator(friendSchema)
  .handler(async ({ data, context: { dB: user } }) => {
    if (!user.id) throw new Error(`[{ "message": "No User ID." }]`);
    await db
      .delete(friendship)
      .where(
        or(
          eq(friendship.id, `${data.receiverId}${user.id}`),
          eq(friendship.id, `${user.id}${data.receiverId}`),
        ),
      );
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
    });
  });

export const getThisFriendship = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware])
  .validator((data: { userId: string }) => data)
  .handler(async ({ context: { dB: user }, data: { userId } }) => {
    if (!user.id) throw new Error(`[{ "message": "No User ID." }]`);
    return await db.query.friendship.findFirst({
      where: (friendship, { or }) =>
        or(
          eq(friendship.id, `${userId}${user.id}`),
          eq(friendship.id, `${user.id}${userId}`),
        ),
    });
  });
