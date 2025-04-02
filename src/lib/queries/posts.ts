import { SortBy } from "@/routes/feed";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import {
  getCurrentUserPosts,
  getPost,
  getPostLikesCount,
  getPosts,
  getUserPosts,
} from "../server/fn/posts";
import { CurrentUserInfo } from "../server/fn/user";

export const postsQueryOptions = (currentUserInfo: CurrentUserInfo, sortBy?: SortBy) =>
  infiniteQueryOptions({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["posts", `sortedBy: ${sortBy}, ${currentUserInfo?.dB.id}`],
    queryFn: ({ signal, pageParam }) =>
      getPosts({
        signal,
        data: { pageParam, sortBy: sortBy ?? "recent", currentUserInfo },
      }),
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

export const currentUserPostsQueryOptions = (sortBy?: SortBy) =>
  infiniteQueryOptions({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["currentUserPosts", sortBy],
    queryFn: ({ signal, pageParam }) =>
      getCurrentUserPosts({
        signal,
        data: { pageParam, sortBy: sortBy ?? "recent" },
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.length === 0) {
        return undefined;
      }
      return lastPageParam + 1;
    },
  });
export type CurrentUserPostsQueryOptions = typeof currentUserPostsQueryOptions;

export const userPostsQueryOptions = (username: string, sortBy?: SortBy) =>
  infiniteQueryOptions({
    queryKey: ["userPosts", username, sortBy],
    queryFn: ({ signal, pageParam }) =>
      getUserPosts({
        signal,
        data: { pageParam, sortBy: sortBy ?? "recent", username },
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.length === 0) {
        return undefined;
      }
      return lastPageParam + 1;
    },
  });
export type UserPostsQueryOptions = typeof userPostsQueryOptions;
