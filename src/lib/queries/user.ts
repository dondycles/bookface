import { queryOptions } from "@tanstack/react-query";
import { getCurrentUserInfo, getUserInfo } from "../server/fn/user";

export const userInfoQueryOptions = (username: string) =>
  queryOptions({
    queryKey: ["userInfo", username],
    queryFn: ({ signal }) => getUserInfo({ data: { username }, signal }),
  });

export const currentUserInfoQueryOptions = () =>
  queryOptions({
    queryKey: ["currentUserInfo"],
    queryFn: ({ signal }) => getCurrentUserInfo({ signal }),
  });
