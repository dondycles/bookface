import { z } from "zod";

export const searchPostsSortBySchema = z.object({
  postsSortBy: z.enum(["likes", "recent"]),
});

export const searchQSchema = z.object({
  q: z
    .string()
    .min(1, "Search cannot be empty.")
    .max(512, "Max of 512 characters only.")
    .trim(),
});

export const searchUsersSortBySchema = z.object({
  usersSortBy: z.enum(["name", "recent"]),
});
export type PostsSortBy = z.infer<typeof searchPostsSortBySchema.shape.postsSortBy>;

export type SearchQ = z.infer<typeof searchQSchema.shape.q>;

export type UsersSortBy = z.infer<typeof searchUsersSortBySchema.shape.usersSortBy>;
