import { z } from "zod";

export const searchPostsOrderBySchema = z.object({
  postsOrderBy: z.enum(["likes", "recent"]),
});

export const searchQSchema = z.object({
  q: z
    .string()
    .min(1, "Search cannot be empty.")
    .max(512, "Max of 512 characters only.")
    .trim(),
});

export const searchUsersOrderBySchema = z.object({
  usersOrderBy: z.enum(["fullName", "dateJoined", "userName"]),
});

export const searchFlowSchema = z.object({
  flow: z.enum(["asc", "desc"]),
});

export type SearchQ = z.infer<typeof searchQSchema.shape.q>;

export type PostsOrderBy = z.infer<typeof searchPostsOrderBySchema.shape.postsOrderBy>;

export type UsersOrderBy = z.infer<typeof searchUsersOrderBySchema.shape.usersOrderBy>;

export type SearchFlow = z.infer<typeof searchFlowSchema.shape.flow>;

export const searchFeedSchema = z.object({
  postsOrderBy: searchPostsOrderBySchema.shape.postsOrderBy,
  flow: searchFlowSchema.shape.flow,
});

export type SearchFeedSchema = z.infer<typeof searchFeedSchema>;

export const searchUsernameSchema = z.object({
  postsOrderBy: searchPostsOrderBySchema.shape.postsOrderBy,
  flow: searchFlowSchema.shape.flow,
});

export const searchSearchSchema = z.object({
  q: searchQSchema.shape.q,
  postsOrderBy: searchPostsOrderBySchema.shape.postsOrderBy,
  usersOrderBy: searchUsersOrderBySchema.shape.usersOrderBy,
  flow: searchFlowSchema.shape.flow,
});
