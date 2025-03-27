import { queryOptions } from "@tanstack/react-query";
import { getComment, getComments } from "../server/fn/comments";

export const commentsQueryOptions = (postId: string) =>
  queryOptions({
    queryKey: ["comments", postId],
    queryFn: () => getComments({ data: { postId } }),
    staleTime: 0,
  });

export const commentQueryOptions = (commentId: string) =>
  queryOptions({
    queryKey: ["comment", commentId],
    queryFn: () => getComment({ data: { commentId } }),
    staleTime: 0,
  });
