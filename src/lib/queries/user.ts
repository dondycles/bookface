import { SortBy } from "@/routes/feed";
import { queryOptions } from "@tanstack/react-query";
import { getCurrentUserInfo, getUserProfile } from "../server/fn/user";

export const userQueryOptions = (username: string, sortBy: SortBy) =>
  queryOptions({
    queryKey: ["user", username, sortBy],
    queryFn: ({ signal }) => getUserProfile({ data: { username, sortBy }, signal }),
  });

export const currentUserInfoQueryOptions = () =>
  queryOptions({
    queryKey: ["currentUserInfo"],
    queryFn: ({ signal }) => getCurrentUserInfo({ signal }),
  });
