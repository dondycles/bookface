import { authMiddleware } from "@/lib/middleware/auth-guard";
import { postLikes } from "@/lib/schema";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "../db";

export const addLikePost = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator((data: { postId: string }) => data)
  .handler(async ({ data: { postId }, context: { dB: user } }) => {
    if (!user.id) throw new Error("No User!");
    await db.insert(postLikes).values({
      likerId: user.id,
      postId: postId,
      id: user.id + postId,
    });
  });

export const removeLikePost = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator((data: { postId: string }) => data)
  .handler(async ({ data: { postId }, context: { dB: user } }) => {
    if (!user.id) throw new Error(`[{ "message": "No User ID." }]`);
    await db.delete(postLikes).where(eq(postLikes.id, user.id + postId));
  });
