import { queryOptions } from "@tanstack/react-query";
import {
  getCurrentUserFriendships,
  getThisFriendship,
  getThisUserAcceptedFriendships,
} from "../server/fn/friendships";

export const currentUserFriendshipsQueryOptions = () =>
  queryOptions({
    queryKey: ["currentUserFriendships"],
    queryFn: ({ signal }) => getCurrentUserFriendships({ signal }),
  });

export const thisFriendshipQueryOptions = (userId: string, currentUserId: string) =>
  queryOptions({
    queryKey: ["friendship", `${currentUserId}${userId}`],
    queryFn: ({ signal }) =>
      getThisFriendship({ signal, data: { userId, currentUserId } }),
  });

export const thisUserAcceptedfriendshipsQueryOptions = (username: string) =>
  queryOptions({
    queryKey: ["acceptdFriendships", username],
    queryFn: ({ signal }) => getThisUserAcceptedFriendships({ signal, data: username }),
  });
