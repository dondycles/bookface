import { authMiddleware } from "@/lib/middleware/auth-guard";
import { post, postLikes } from "@/lib/schema";

import { PostsSortBy } from "@/lib/search-schema";
import { createServerFn } from "@tanstack/react-start";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { CurrentUserInfo } from "./user";

export const postSchema = z.object({
  message: z
    .string()
    .min(1, "Post cannot be empty.")
    .max(512, "Max of 512 characters only.")
    .trim(),
  privacy: z.enum(["public", "private"]),
});

export const getPostLikesCount = createServerFn({ method: "GET" })
  .validator((postId: string) => postId)
  .handler(async ({ data }) => {
    return await db.$count(postLikes, eq(postLikes.postId, data));
  });

export const getPosts = createServerFn({ method: "GET" })
  .validator(
    (data: {
      pageParam: number;
      sortBy: PostsSortBy;
      currentUserInfo: CurrentUserInfo;
    }) => data,
  )
  .handler(async ({ data }) => {
    return await db.query.post.findMany({
      columns: {
        id: true,
      },

      orderBy: ({ createdAt, id }, { desc }) => [
        data.sortBy === "likes"
          ? desc(sql<number>`(SELECT COUNT(id) FROM "postLikes" WHERE "postId" = ${id})`)
          : desc(createdAt),
      ],
      where: (posts, { eq, or }) =>
        !data.currentUserInfo
          ? eq(posts.privacy, "public")
          : or(eq(posts.privacy, "public"), eq(posts.userId, data.currentUserInfo.dB.id)),
      limit: 10,
      offset: data.pageParam * 10,
    });
  });

export const getCurrentUserPosts = createServerFn({ method: "GET" })
  .validator((data: { pageParam: number; sortBy: PostsSortBy }) => data)
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    return await db.query.post.findMany({
      columns: {
        id: true,
      },

      orderBy: ({ createdAt, id }, { desc }) => [
        data.sortBy === "likes"
          ? desc(sql<number>`(SELECT COUNT(id) FROM "postLikes" WHERE "postId" = ${id})`)
          : desc(createdAt),
      ],
      where: (posts, { eq }) => eq(posts.userId, context.dB.id),
      limit: 10,
      offset: data.pageParam * 10,
    });
  });
export type CurrentUserPosts = NonNullable<
  Awaited<ReturnType<typeof getCurrentUserPosts>>
>;

export const getUserPosts = createServerFn({ method: "GET" })
  .validator((data: { pageParam: number; sortBy: PostsSortBy; username: string }) => data)
  .handler(async ({ data }) => {
    if (!data.username) throw new Error(`[{ "message": "No Username" }]`);
    return await db.query.post.findMany({
      columns: {
        id: true,
      },

      orderBy: ({ createdAt, id }, { desc }) => [
        data.sortBy === "likes"
          ? desc(sql<number>`(SELECT COUNT(id) FROM "postLikes" WHERE "postId" = ${id})`)
          : desc(createdAt),
      ],
      where: (posts, { sql, and, eq }) =>
        and(
          sql`(select "id" from "user" where "username" = ${data.username}) = ${posts.userId}`,
          eq(posts.privacy, "public"),
        ),
      limit: 10,
      offset: data.pageParam * 10,
    });
  });

export const getPost = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data }) => {
    if (!data) throw new Error(`[{ "message": "No Post Id" }]`);
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
        privacy: data.privacy,
      })
      .returning();
    return postData[0];
  });

export const editPost = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator((data: { lastPost: Post; newPost: z.infer<typeof postSchema> }) => data)
  .handler(async ({ data: { lastPost, newPost }, context: { dB: user } }) => {
    if (!lastPost.id) throw new Error(`[{ "message": "No Post ID." }]`);
    if (!user.id) throw new Error(`[{ "message": "No User ID." }]`);

    if (lastPost.userId !== user.id)
      throw new Error(`[{ "message": "You are not the author." }]`);
    if (lastPost.message === newPost.message && lastPost.privacy === newPost.privacy)
      throw new Error(`[{ "message": "No changes made." }]`);
    const message = newPost.message;
    const privacy = newPost.privacy;
    postSchema.parse({ message, privacy });
    await db
      .update(post)
      .set({
        updatedAt: new Date(),
        ...newPost,
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

export const deleteMultiplePosts = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator((data: { posts: Post[] | null }) => data)
  .handler(async ({ data, context: { dB: user } }) => {
    if (!user.id) throw new Error(`[{ "message": "No User ID." }]`);
    if (data.posts === null) throw new Error(`[{ "message": "No Selected Posts." }]`);
    await db.transaction(async (tx) => {
      for (const p of data.posts!) {
        if (p.userId !== user.id) {
          throw new Error(
            `[{ "message": "You are not the author of post ID ${p.id}." }]`,
          );
        }
        await tx.delete(post).where(and(eq(post.userId, user.id), eq(post.id, p.id)));
      }
    });
  });
