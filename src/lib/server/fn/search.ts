import { SortBy } from "@/lib/global-schema";
import { createServerFn } from "@tanstack/react-start";
import { sql } from "drizzle-orm";
import { db } from "../db";

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

export const getPostsResults = createServerFn({ method: "GET" })
  .validator((data: { q: string; pageParam: number; sortBy: SortBy }) => data)
  .handler(async ({ data: { q, sortBy, pageParam } }) => {
    const posts = await db.query.post.findMany({
      columns: {
        id: true,
      },
      where: (posts, { ilike }) => ilike(posts.message, `%${q}%`),
      orderBy: ({ createdAt, id }, { desc }) => [
        sortBy === "likes"
          ? desc(sql<number>`(SELECT COUNT(id) FROM "postLikes" WHERE "postId" = ${id})`)
          : desc(createdAt),
      ],
      limit: 5,
      offset: pageParam * 5,
    });
    return posts;
  });
export const getUsersResults = createServerFn({ method: "GET" })
  .validator((data: { q: string; pageParam: number; sortBy: SortBy }) => data)
  .handler(async ({ data: { q, pageParam } }) => {
    const users = await db.query.user.findMany({
      with: {
        posts: {
          columns: {
            id: true,
          },
        },
      },
      where: (users, { ilike, or }) =>
        or(ilike(users.email, q), ilike(users.username, `%${q}%`)),
      limit: 5,
      offset: pageParam * 5,
    });
    return users;
  });
