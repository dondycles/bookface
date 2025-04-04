import { infiniteQueryOptions } from "@tanstack/react-query";
import { PostsOrderBy, SearchFlow, UsersOrderBy } from "../search-schema";
import { getPostsResults, getUsersResults } from "../server/fn/search";

export const searchPostsQueryOptions = (
  q: string,
  postsOrderBy: PostsOrderBy,
  flow: SearchFlow,
) =>
  infiniteQueryOptions({
    queryKey: ["searchPosts", q, postsOrderBy, flow],
    queryFn: ({ signal, pageParam }) =>
      getPostsResults({
        data: {
          pageParam,
          q,
          postsOrderBy,
          flow,
        },
        signal,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.length === 0) {
        return undefined;
      }
      return lastPageParam + 1;
    },
  });
export const searchUsersQueryOptions = (
  q: string,
  usersOrderBy: UsersOrderBy,
  flow: SearchFlow,
) =>
  infiniteQueryOptions({
    queryKey: ["searchUsers", q, usersOrderBy, flow],
    queryFn: ({ signal, pageParam }) =>
      getUsersResults({
        data: {
          pageParam,
          q,
          usersOrderBy,
          flow,
        },
        signal,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.length === 0) {
        return undefined;
      }
      return lastPageParam + 1;
    },
  });
