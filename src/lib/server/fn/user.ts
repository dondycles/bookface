/* eslint-disable @typescript-eslint/no-explicit-any */
import { authMiddleware } from "@/lib/middleware/auth-guard";
import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "../auth";
import { db } from "../db";
import { user } from "../schema";

export const settingsSchema = z.object({
  name: z.string().min(1, "Name cannot be empty.").max(72, "Max of 72 characters only."),
  username: z
    .string()
    .min(1, "Username cannot be empty.")
    .max(32, "Max of 32 characters only."),
  bio: z.string().max(72, "Max of 72 characters only."),
});

export const updateUsername = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: any) => data)
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

export const editProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .validator(settingsSchema)
  .handler(async ({ data, context: { dB } }) => {
    if (!dB.id) throw new Error("No User!");
    await db.update(user).set(data).where(eq(user.id, dB.id));
  });
