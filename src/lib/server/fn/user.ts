import { bioSchema } from "@/lib/components/edit-bio-dialog";
import { usernameSchema } from "@/lib/components/set-username-dialog";
import { authMiddleware } from "@/lib/middleware/auth-guard";
import { settingsSchema } from "@/routes/settings/route";
import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { auth } from "../auth";
import { db } from "../db";
import { user } from "../schema";

export const updateUsername = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(usernameSchema)
  .handler(async ({ data, context: { dB } }) => {
    await db
      .update(user)
      .set({
        username: data.username,
      })
      .where(eq(user.id, dB.id));
  });

export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  const { headers } = getWebRequest()!;
  const session = await auth.api.getSession({ headers });
  if (!session) return null;
  const dB = await db.query.user.findFirst({
    where: (user, { eq }) => eq(user.id, session.user.id),
    with: {
      posts: {
        columns: {
          id: true,
        },
      },
    },
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
  .validator(bioSchema)
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

export const editProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(settingsSchema)
  .handler(async ({ data, context: { dB } }) => {
    if (!dB.id) throw new Error("No User!");
    await db.update(user).set(data).where(eq(user.id, dB.id));
  });
