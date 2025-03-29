import { authMiddleware } from "@/lib/middleware/auth-guard";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { post, postComments } from "../schema";
export const commentSchema = z.object({
  message: z
    .string()
    .min(1, "Comment cannot be empty.")
    .max(512, "Max of 512 characters only."),
});
export const addComment = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator(
    (data: {
      message: typeof postComments.$inferInsert.message;
      postId: typeof post.$inferSelect.id;
    }) => data,
  )
  .handler(async ({ data, context: { dB: user } }) => {
    if (!user.id) throw new Error("No User!");
    if (data.message.length === 0) throw new Error("Comment Cannot Be Empty.");

    await db.insert(postComments).values({
      commenterId: user.id,
      message: data.message,
      postId: data.postId,
    });
  });

export const editComment = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator(
    (data: {
      lastComment: Comment;
      newMessage: z.infer<typeof commentSchema>["message"];
    }) => data,
  )
  .handler(async ({ data: { lastComment, newMessage }, context: { dB: user } }) => {
    if (!user.id) throw new Error("No User ID!");
    if (!lastComment.id) throw new Error("No  Post ID!");
    if (lastComment.message === newMessage) return;
    commentSchema.parse({ message: newMessage });
    await db
      .update(postComments)
      .set({
        message: newMessage,
        updatedAt: new Date(),
      })
      .where(eq(postComments.id, lastComment.id));
  });

export const removeComment = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator((data: { commentId: typeof postComments.$inferSelect.id }) => data)
  .handler(async ({ data: { commentId }, context: { dB: user } }) => {
    if (!user.id) throw new Error("No User!");
    await db.delete(postComments).where(eq(postComments.id, commentId));
  });

export const getComments = createServerFn({
  method: "GET",
})
  .validator((data: { postId: typeof post.$inferSelect.id }) => data)
  .handler(async ({ data: { postId } }) => {
    return await db.query.postComments.findMany({
      where: (postComments, { eq }) => eq(postComments.postId, postId),
      columns: {
        id: true,
      },
      orderBy: (postComments, { desc }) => [desc(postComments.createdAt)],
    });
  });

export const getComment = createServerFn({
  method: "GET",
})
  .validator((data: { commentId: typeof postComments.$inferSelect.id }) => data)
  .handler(async ({ data: { commentId } }) => {
    return await db.query.postComments.findFirst({
      where: (postComments, { eq }) => eq(postComments.id, commentId),
      with: {
        commenter: true,
      },
    });
  });
export type Comment = NonNullable<Awaited<ReturnType<typeof getComment>>>;
