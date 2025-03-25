import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { authMiddleware } from "~/lib/middleware/auth-guard";
import { db } from "../db";
import { post } from "../schema";

export const getPosts = createServerFn({ method: "GET" }).handler(async () => {
  return await db.query.post.findMany({
    with: {
      author: true,
    },
    orderBy: (posts, { desc }) => [desc(posts.createdAt)],
  });
});

export const getPost = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data }) => {
    return await db.query.post.findFirst({
      with: {
        author: true,
      },
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
      where: (posts, { eq }) => eq(posts.id, data),
    });
  });

export const addPost = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator((data: { message: typeof post.$inferInsert.message }) => data)
  .handler(async ({ data, context: { user } }) => {
    if (!user.id) throw Error("No User!");
    await db.insert(post).values({
      message: data.message,
      userId: user.id,
    });
  });

export const deletePost = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator((data: { id: typeof post.$inferInsert.id }) => data)
  .handler(async ({ data, context: { user } }) => {
    if (!data.id) throw Error("No  Post ID!");
    if (!user.id) throw Error("No  User ID!");
    await db.delete(post).where(and(eq(post.userId, user.id), eq(post.id, data.id)));
  });
