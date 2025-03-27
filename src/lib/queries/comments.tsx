import { queryOptions } from "@tanstack/react-query";
import { getComment, getComments } from "../server/fn/comments";

export const commentsQueryOptions = (postId: string) =>
  queryOptions({
    queryKey: ["comments", postId],
    queryFn: ({ signal }) => getComments({ data: { postId }, signal }),
  });

export const commentQueryOptions = (commentId: string) =>
  queryOptions({
    queryKey: ["comment", commentId],
    queryFn: ({ signal }) => getComment({ data: { commentId }, signal }),
  });
