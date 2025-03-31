import { SortBy } from "@/routes/feed";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { getPost, getPosts } from "../server/fn/posts";

export const postsQueryOptions = (sortBy: SortBy) =>
  infiniteQueryOptions({
    queryKey: ["posts", sortBy],
    queryFn: ({ signal, pageParam }) => getPosts({ signal, data: { pageParam, sortBy } }),
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
