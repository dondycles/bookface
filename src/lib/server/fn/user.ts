import { authMiddleware } from "@/lib/middleware/auth-guard";
import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { auth } from "../auth";
import { db } from "../db";
import { user, username } from "../schema";

export const updateUsername = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { username: string }) => data)
  .handler(async ({ data, context: { dB } }) => {
    await db.insert(username).values({
      userId: dB.id,
      username: data.username,
    });
  });

export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  const { headers } = getWebRequest()!;
  const session = await auth.api.getSession({ headers });
  if (!session) return null;
  const dB = await db.query.user.findFirst({
    where: (user, { eq }) => eq(user.id, session.user.id),
  });
  if (!dB) return null;
  return { session, dB };
});

export type CurrentUser = Awaited<ReturnType<typeof getCurrentUser>>;

export const getUserProfile = createServerFn({ method: "GET" })
  .validator((data: { username: string }) => data)
  .handler(async ({ data: { username } }) => {
    return await db.query.user.findFirst({
      where: (user, { eq }) => eq(user.username, username),
      with: {
        posts: {
          columns: {
            id: true,
          },
        },
      },
    });
  });

export const editBio = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { bio: string }) => data)
  .handler(async ({ data, context: { dB } }) => {
    if (!dB.id) throw new Error("No User!");
    if (data.bio.length === 0) throw new Error("Bio Cannot Be Empty.");
    if (data.bio === dB.bio) return;
    await db
      .update(user)
      .set({
        bio: data.bio,
      })
      .where(eq(user.id, dB.id));
  });
