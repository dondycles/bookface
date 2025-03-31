/* eslint-disable @typescript-eslint/no-explicit-any */
import { authMiddleware } from "@/lib/middleware/auth-guard";
import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { post } from "../schema";

export const postSchema = z.object({
  message: z
    .string()
    .min(1, "Post cannot be empty.")
    .max(512, "Max of 512 characters only."),
});

export const getPosts = createServerFn({ method: "GET" }).handler(async () => {
  return await db.query.post.findMany({
    orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    columns: { id: true },
  });
});

export const getPost = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data }) => {
    return await db.query.post.findFirst({
      with: {
        author: true,
        likers: {
          with: {
            likerData: true,
          },
          orderBy: (likers, { desc }) => [desc(likers.createdAt)],
        },
        comments: {
          columns: {
            id: true,
          },
          orderBy: (comments, { desc }) => [desc(comments.createdAt)],
        },
      },
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
      where: (posts, { eq }) => eq(posts.id, data),
    });
  });

export type Post = NonNullable<Awaited<ReturnType<typeof getPost>>>;

export const addPost = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware])
  .validator(postSchema)
  .handler(async ({ data, context: { dB: user } }) => {
    if (!user.id) throw new Error(`[{ "message": "No User ID." }]`);
    const postData = await db
      .insert(post)
      .values({
        message: data.message,
        userId: user.id,
      })
      .returning();
    return postData[0];
  });

export const editPost = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator(
    (data: { lastPost: Post; newMessage: z.infer<typeof postSchema>["message"] }) => data,
  )
  .handler(async ({ data: { lastPost, newMessage }, context: { dB: user } }) => {
    if (!lastPost.id) throw new Error(`[{ "message": "No Post ID." }]`);
    if (!user.id) throw new Error(`[{ "message": "No User ID." }]`);
    if (lastPost.message === newMessage)
      throw new Error(`[{ "message": "No changes made." }]`);
    if (lastPost.userId !== user.id)
      throw new Error(`[{ "message": "You are not the author." }]`);
    if (lastPost.message === newMessage)
      throw new Error(`[{ "message": "No changes made." }]`);
    const message = newMessage;
    postSchema.parse({ message });
    await db
      .update(post)
      .set({
        message: newMessage,
        updatedAt: new Date(),
      })
      .where(eq(post.id, lastPost.id));
  });

export const deletePost = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator((data: { post: Post }) => data)
  .handler(async ({ data, context: { dB: user } }) => {
    if (!data.post.id) throw new Error(`[{ "message": "No Post ID." }]`);
    if (!user.id) throw new Error(`[{ "message": "No User ID." }]`);
    if (data.post.userId !== user.id)
      throw new Error(`[{ "message": "You are not the author." }]`);
    await db.delete(post).where(and(eq(post.userId, user.id), eq(post.id, data.post.id)));
  });
