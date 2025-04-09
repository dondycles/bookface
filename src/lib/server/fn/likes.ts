import { authMiddleware } from "@/lib/middleware/auth-guard";
import { post, postLikes } from "@/lib/schema";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { pusher } from "../pusher";
import { sendNotification } from "./notification";
import { Post } from "./posts";

export const addLikePost = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator((data: { post: Post }) => data)
  .handler(async ({ data: { post }, context: { dB: user } }) => {
    if (!user.id) throw new Error(`[{ "message": "No User ID." }]`);
    const likeData = await db
      .insert(postLikes)
      .values({
        likerId: user.id,
        postId: post.id,
        id: user.id + post.id,
      })
      .returning({ id: postLikes.id });
    await sendNotification({
      data: {
        receiverId: post.userId,
        type: "like",
        likeId: likeData[0].id,
      },
    });
  });

export const removeLikePost = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator((data: { post: typeof post.$inferSelect }) => data)
  .handler(async ({ data: { post }, context: { dB: user } }) => {
    if (!user.id) throw new Error(`[{ "message": "No User ID." }]`);
    await db.delete(postLikes).where(eq(postLikes.id, user.id + post.id));
    if (post.userId !== user.id) await pusher.trigger(post.userId, "notification", null);
  });
