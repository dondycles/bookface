import { z } from "zod";

export const searchSortBySchema = z.object({
  sortBy: z.enum(["likes", "recent"]),
});

export const searchQSchema = z.object({
  q: z
    .string()
    .min(1, "Search cannot be empty.")
    .max(512, "Max of 512 characters only.")
    .trim(),
});

export type SortBy = z.infer<typeof searchSortBySchema.shape.sortBy>;

export type Q = z.infer<typeof searchQSchema.shape.q>;
