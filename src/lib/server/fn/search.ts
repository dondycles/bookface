import { PostsOrderBy, SearchFlow, UsersOrderBy } from "@/lib/search-schema";
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

// * now with orderBy and flow
export const getPostsResults = createServerFn({ method: "GET" })
  .validator(
    (data: {
      q: string;
      pageParam: number;
      postsOrderBy: PostsOrderBy;
      flow: SearchFlow;
    }) => data,
  )
  .handler(async ({ data: { q, postsOrderBy, pageParam, flow } }) => {
    const posts = await db.query.post.findMany({
      columns: {
        id: true,
      },
      where: (posts, { ilike }) => ilike(posts.message, `%${q}%`),
      orderBy: ({ createdAt, id }, { desc, asc }) => [
        postsOrderBy === "likes"
          ? flow === "asc"
            ? asc(sql<number>`(SELECT COUNT(id) FROM "postLikes" WHERE "postId" = ${id})`)
            : desc(
                sql<number>`(SELECT COUNT(id) FROM "postLikes" WHERE "postId" = ${id})`,
              )
          : flow === "asc"
            ? asc(createdAt)
            : desc(createdAt),
      ],
      limit: 5,
      offset: pageParam * 5,
    });
    return posts;
  });

// * now with orderBy and flow
export const getUsersResults = createServerFn({ method: "GET" })
  .validator(
    (data: {
      q: string;
      pageParam: number;
      usersOrderBy: UsersOrderBy;
      flow: SearchFlow;
    }) => data,
  )
  .handler(async ({ data: { q, pageParam, flow, usersOrderBy } }) => {
    const users = await db.query.user.findMany({
      with: {
        posts: {
          columns: {
            id: true,
          },
        },
      },
      orderBy: ({ name, createdAt, username }, { asc, desc }) => {
        if (usersOrderBy === "dateJoined") {
          return [flow === "asc" ? asc(createdAt) : desc(createdAt)];
        } else if (usersOrderBy === "fullName") {
          return [flow === "asc" ? asc(name) : desc(name)];
        } else if (usersOrderBy === "userName") {
          return [flow === "asc" ? asc(username) : desc(username)];
        } else {
          return [flow === "asc" ? asc(createdAt) : desc(createdAt)];
        }
      },
      where: (users, { ilike, or }) =>
        or(ilike(users.email, `%${q}%`), ilike(users.username, `%${q}%`)),
      limit: 5,
      offset: pageParam * 5,
    });
    return users;
  });
