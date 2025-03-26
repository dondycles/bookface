import { authMiddleware } from "@/lib/middleware/auth-guard";
import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { auth } from "../auth";
import { db } from "../db";
import { username } from "../schema";

export const updateUsername = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { username: string }) => data)
  .handler(async ({ data, context: { user } }) => {
    await db.insert(username).values({
      userId: user.id,
      username: data.username,
    });
  });

export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  const { headers } = getWebRequest()!;
  const session = await auth.api.getSession({ headers });

  return session?.user || null;
});

export type CurrentUser = Awaited<ReturnType<typeof getCurrentUser>>;

export const getUserProfile = createServerFn({ method: "GET" })
  .validator((data: { username: string }) => data)
  .handler(async ({ data: { username } }) => {
    return await db.query.user.findFirst({
      where: (user, { eq }) => eq(user.username, username),
      with: {
        posts: {
          with: {
            author: true,
            likers: {
              with: {
                likerData: true,
              },
            },
          },
        },
      },
    });
  });
