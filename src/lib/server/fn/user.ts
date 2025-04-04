/* eslint-disable @typescript-eslint/no-explicit-any */
import { authMiddleware } from "@/lib/middleware/auth-guard";
import { user } from "@/lib/schema";
import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "../auth";
import { db } from "../db";

export const settingsSchema = z.object({
  name: z
    .string()
    .min(1, "Name cannot be empty.")
    .max(72, "Max of 72 characters only.")
    .trim(),
  username: z
    .string()
    .min(1, "Username cannot be empty.")
    .max(32, "Max of 32 characters only.")
    .trim(),
  bio: z.string().max(72, "Max of 72 characters only.").trim(),
});

export const usernameSchema = z.object({
  username: z
    .string()
    .min(1, "Username cannot be empty.")
    .max(32, "Max of 32 characters only."),
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

export const getCurrentUserInfo = createServerFn({ method: "GET" }).handler(async () => {
  const { headers } = getWebRequest()!;
  const session = await auth.api.getSession({ headers });
  if (!session) return null;
  const dB = await db.query.user.findFirst({
    where: (user, { eq }) => eq(user.id, session.user.id),
  });
  if (!dB) return null;
  return { session, dB };
});

export type CurrentUserInfo = Awaited<ReturnType<typeof getCurrentUserInfo>>;

export const getUserInfo = createServerFn({ method: "GET" })
  .validator((data: { username: string }) => data)
  .handler(async ({ data: { username } }) => {
    return await db.query.user.findFirst({
      where: (user, { eq }) => eq(user.username, username),
    });
  });

export const editProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(settingsSchema)
  .handler(async ({ data, context: { dB } }) => {
    if (!dB.id) throw new Error(`[{ "message": "No User ID." }]`);
    if (dB.bio === data.bio && dB.name === data.name && dB.username === data.username)
      throw new Error(`[{ "message": "No changes made." }]`);

    await db.update(user).set(data).where(eq(user.id, dB.id));
  });

//  onError: (e: Error) => {
//       form.reset();
//       toast.error(JSON.parse(e.message)[0].message as string, {});
//     },
