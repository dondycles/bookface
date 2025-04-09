import { authMiddleware } from "@/lib/middleware/auth-guard";
import { post, postComments } from "@/lib/schema";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { pusher } from "../pusher";
import { sendNotification } from "./notification";
import { Post } from "./posts";
export const commentSchema = z.object({
  message: z
    .string()
    .min(1, "Comment cannot be empty.")
    .max(512, "Max of 512 characters only.")
    .trim(),
});
export const addComment = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator(
    (data: { message: typeof postComments.$inferInsert.message; post: Post }) => data,
  )
  .handler(async ({ data, context: { dB: user } }) => {
    if (!user.id) throw new Error(`[{ "message": "No User ID." }]`);
    if (data.message.length === 0)
      throw new Error(`[{ "message": "Comment cannot be empty" }]`);

    const commentData = await db
      .insert(postComments)
      .values({
        commenterId: user.id,
        message: data.message,
        postId: data.post.id,
      })
      .returning({ id: postComments.id });

    if (data.post.userId !== user.id)
      await sendNotification({
        data: {
          receiverId: data.post.userId,
          type: "comment",
          commentId: commentData[0].id,
          receiverUsername: data.post.author.username ?? data.post.author.name,
          commentMessage: data.message,
        },
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
    if (!user.id) throw new Error(`[{ "message": "No User ID." }]`);
    if (!lastComment.id) throw new Error(`[{ "message": "No Post ID." }]`);
    if (lastComment.message === newMessage)
      throw new Error(`[{ "message": "No changes made." }]`);
    if (newMessage.length === 0) throw new Error(`[{ "message": "No Comment ID." }]`);
    if (lastComment.commenterId !== user.id)
      throw new Error(`[{ "message": "Not your comment." }]`);
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
  .validator((data: { comment: Comment; post: Post }) => data)
  .handler(async ({ data: { comment, post }, context: { dB: user } }) => {
    if (!user.id) throw new Error(`[{ "message": "No User ID." }]`);
    if (!comment.id) throw new Error(`[{ "message": "No Comment ID." }]`);
    if (comment.commenterId !== user.id && post.userId !== user.id)
      throw new Error(`[{ "message": "Not Authorized for Deletion." }]`);
    await db.delete(postComments).where(eq(postComments.id, comment.id));
    if (post.userId !== user.id) await pusher.trigger(post.userId, "notification", null);
  });

export const getComments = createServerFn({
  method: "GET",
})
  .validator((data: { postId: typeof post.$inferSelect.id; pageParam: number }) => data)
  .handler(async ({ data: { postId, pageParam } }) => {
    return await db.query.postComments.findMany({
      where: (postComments, { eq }) => eq(postComments.postId, postId),
      columns: {
        id: true,
      },
      orderBy: (postComments, { desc }) => [desc(postComments.createdAt)],
      limit: 2,
      offset: pageParam * 2,
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
