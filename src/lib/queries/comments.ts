import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { getComment, getComments } from "../server/fn/comments";

export const commentsQueryOptions = (postId: string) =>
  infiniteQueryOptions({
    queryKey: ["comments", postId],
    queryFn: ({ signal, pageParam }) =>
      getComments({ data: { postId, pageParam }, signal }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.length === 0) {
        return undefined;
      }
      return lastPageParam + 1;
    },
  });

export type CommentsQueryOptions = typeof commentsQueryOptions;

export const commentQueryOptions = (commentId: string) =>
  queryOptions({
    queryKey: ["comment", commentId],
    queryFn: ({ signal }) => getComment({ data: { commentId }, signal }),
  });
