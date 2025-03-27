import { queryOptions } from "@tanstack/react-query";
import { getCurrentUser, getUserProfile } from "../server/fn/auth";

export const userQueryOptions = (username: string) =>
  queryOptions({
    queryKey: ["user", username],
    queryFn: ({ signal }) => getUserProfile({ data: { username }, signal }),
  });

export const currentUserQueryOptions = () => {
  queryOptions({
    queryKey: ["currentUser"],
    queryFn: ({ signal }) => getCurrentUser({ signal }),
  });
};
