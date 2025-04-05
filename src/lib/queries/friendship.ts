import { queryOptions } from "@tanstack/react-query";
import { getCurrentUserFriendships, getThisFriendship } from "../server/fn/friendships";

export const currentUserFriendshipsQueryOptions = () =>
  queryOptions({
    queryKey: ["currentUserFriendships"],
    queryFn: ({ signal }) => getCurrentUserFriendships({ signal }),
  });

export const thisFriendshipQueryOptions = (userId: string, currentUserId: string) =>
  queryOptions({
    queryKey: ["friendship", `${currentUserId}${userId}`],
    queryFn: ({ signal }) => getThisFriendship({ signal, data: { userId } }),
  });
