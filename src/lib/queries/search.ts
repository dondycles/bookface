import { infiniteQueryOptions } from "@tanstack/react-query";
import { PostsSortBy, UsersSortBy } from "../search-schema";
import { getPostsResults, getUsersResults } from "../server/fn/search";

export const searchPostsQueryOptions = (q: string, sortBy?: PostsSortBy) =>
  infiniteQueryOptions({
    queryKey: ["searchPosts", q, sortBy],
    queryFn: ({ signal, pageParam }) =>
      getPostsResults({ data: { pageParam, q, sortBy: sortBy ?? "recent" }, signal }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.length === 0) {
        return undefined;
      }
      return lastPageParam + 1;
    },
  });
export const searchUsersQueryOptions = (q: string, sortBy?: UsersSortBy) =>
  infiniteQueryOptions({
    queryKey: ["searchUsers", q, sortBy],
    queryFn: ({ signal, pageParam }) =>
      getUsersResults({ data: { pageParam, q, sortBy: sortBy ?? "recent" }, signal }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.length === 0) {
        return undefined;
      }
      return lastPageParam + 1;
    },
  });
