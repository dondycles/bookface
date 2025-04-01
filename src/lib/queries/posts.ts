import { SortBy } from "@/routes/feed";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { getPost, getPostLikesCount, getPosts } from "../server/fn/posts";
import { CurrentUser } from "../server/fn/user";

export const postsQueryOptions = (currentUser: CurrentUser, sortBy?: SortBy) =>
  infiniteQueryOptions({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["posts", `sortedBy: ${sortBy}, ${currentUser?.dB.id}`],
    queryFn: ({ signal, pageParam }) =>
      getPosts({ signal, data: { pageParam, sortBy: sortBy ?? "recent", currentUser } }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.length === 0) {
        return undefined;
      }
      return lastPageParam + 1;
    },
  });

export type PostsQueryOptions = typeof postsQueryOptions;

export const postQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["post", id],
    queryFn: ({ signal }) => getPost({ data: id, signal }),
  });

export const postLikesQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["postLikes", id],
    queryFn: ({ signal }) => getPostLikesCount({ data: id, signal }),
  });
