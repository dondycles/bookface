import { authMiddleware } from "@/lib/middleware/auth-guard";
import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { post } from "../schema";

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
  method: "POST",
})
  .middleware([authMiddleware])
  .validator((data: { message: typeof post.$inferInsert.message }) => data)
  .handler(async ({ data, context: { user } }) => {
    if (!user.id) throw new Error("No User!");
    if (data.message.length === 0) return "Post Cannot Be Empty.";
    await db.insert(post).values({
      message: data.message,
      userId: user.id,
    });
  });

export const editPost = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator(
    (data: {
      lastPost: typeof post.$inferSelect;
      newMessage: typeof post.$inferInsert.message;
    }) => data,
  )
  .handler(async ({ data: { lastPost, newMessage }, context: { user } }) => {
    if (!lastPost.id) throw new Error("No  Post ID!");
    if (!user.id) throw new Error("No  User ID!");
    if (lastPost.message === newMessage) return;
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
  .validator((data: { id: typeof post.$inferInsert.id }) => data)
  .handler(async ({ data, context: { user } }) => {
    if (!data.id) throw new Error("No  Post ID!");
    if (!user.id) throw new Error("No  User ID!");
    await db.delete(post).where(and(eq(post.userId, user.id), eq(post.id, data.id)));
  });
