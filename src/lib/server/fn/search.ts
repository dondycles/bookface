import { createServerFn } from "@tanstack/react-start";
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

export const getSearchResult = createServerFn({ method: "GET" })
  .validator((q: string) => q)
  .handler(async ({ data: q }) => {
    const posts = await db.query.post.findMany({
      columns: {
        id: true,
      },
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
      where: (posts, { ilike }) => ilike(posts.message, `%${q}%`),
    });
    const users = await db.query.user.findMany({
      with: {
        posts: {
          columns: {
            id: true,
          },
        },
      },
      orderBy: (users, { desc }) => [desc(users.createdAt)],
      where: (users, { ilike, or }) =>
        or(ilike(users.email, q), ilike(users.username, `%${q}%`)),
    });
    return { posts, users };
  });
