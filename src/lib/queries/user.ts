import { queryOptions } from "@tanstack/react-query";
import { getCurrentUserInfo, getUserInfo } from "../server/fn/user";

export const userInfoQueryOptions = (username: string, id?: string) =>
  queryOptions({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["userInfo", username],
    queryFn: ({ signal }) => getUserInfo({ data: { username, id }, signal }),
  });

export const currentUserInfoQueryOptions = () =>
  queryOptions({
    queryKey: ["currentUserInfo"],
    queryFn: ({ signal }) => getCurrentUserInfo({ signal }),
  });
