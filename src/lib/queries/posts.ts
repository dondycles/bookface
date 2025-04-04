import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { PostsOrderBy, SearchFlow } from "../search-schema";
import {
  getCurrentUserPosts,
  getPost,
  getPostLikesCount,
  getPosts,
  getUserPosts,
} from "../server/fn/posts";
import { CurrentUserInfo } from "../server/fn/user";

// * done with order and flow
export const postsQueryOptions = (
  currentUserInfo: CurrentUserInfo,
  postsOrderBy: PostsOrderBy,
  flow: SearchFlow,
) =>
  infiniteQueryOptions({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["posts", `orderedBy: ${postsOrderBy} ${flow}, ${currentUserInfo?.dB.id}`],
    queryFn: ({ signal, pageParam }) =>
      getPosts({
        signal,
        data: {
          pageParam,
          postsOrderBy,
          flow,
          currentUserInfo,
        },
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

export const currentUserPostsQueryOptions = (
  postsOrderBy: PostsOrderBy,
  flow: SearchFlow,
) =>
  infiniteQueryOptions({
    queryKey: ["currentUserPosts", postsOrderBy, flow],
    queryFn: ({ signal, pageParam }) =>
      getCurrentUserPosts({
        signal,
        data: { pageParam, postsOrderBy: postsOrderBy, flow },
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

export const userPostsQueryOptions = (
  username: string,
  postsOrderBy: PostsOrderBy,
  flow: SearchFlow,
) =>
  infiniteQueryOptions({
    queryKey: ["userPosts", username, postsOrderBy, flow],
    queryFn: ({ signal, pageParam }) =>
      getUserPosts({
        signal,
        data: {
          pageParam,
          postsOrderBy: postsOrderBy,
          flow,
          username,
        },
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
