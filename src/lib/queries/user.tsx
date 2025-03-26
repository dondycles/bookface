import { queryOptions } from "@tanstack/react-query";
import { getUserProfile } from "../server/fn/auth";

export const userQueryOptions = (username: string) =>
  queryOptions({
    queryKey: ["user", username],
    queryFn: () => getUserProfile({ data: { username } }),
    staleTime: 0,
  });
