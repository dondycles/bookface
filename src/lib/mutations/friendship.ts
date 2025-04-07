import { useMutation } from "@tanstack/react-query";
import {
  acceptFriendshipRequest,
  addFriendshipRequest,
  removeFriendship,
} from "../server/fn/friendships";
import { errorHandlerWithToast, successHandlerWithToast } from "../utils";

export const useAddFriendshipRequestMutation = ({
  currentUserId,
  targetedUserId,
}: {
  currentUserId: string;
  targetedUserId: string;
}) => {
  return useMutation({
    mutationFn: async () => {
      return await addFriendshipRequest({ data: { receiverId: targetedUserId } });
    },
    onSuccess: () => {
      successHandlerWithToast("info", "Friendship Requested.");
    },
    onError: (e: Error) => errorHandlerWithToast(e),
    mutationKey: ["addFriendship", `${currentUserId}${targetedUserId}`],
  });
};

export const useRemoveFriendshipMutation = ({
  ids,
}: {
  ids: { friendshipId: string; updateReceiverId: string };
}) => {
  return useMutation({
    mutationFn: async () => {
      return await removeFriendship({
        data: { friendshipId: ids.friendshipId, updateReceiverId: ids.updateReceiverId },
      });
    },
    onSuccess: () => {
      successHandlerWithToast("info", "Friendship Cancelled.");
    },
    onError: (e: Error) => errorHandlerWithToast(e),
    mutationKey: ["removeFriendship", `${ids.friendshipId}`],
  });
};

export const useAcceptFriendshipRequestMutation = ({
  ids,
}: {
  ids: { friendshipId: string; updateReceiverId: string };
}) => {
  return useMutation({
    mutationFn: async () => {
      return await acceptFriendshipRequest({
        data: { friendshipId: ids.friendshipId, updateReceiverId: ids.updateReceiverId },
      });
    },
    onSuccess: () => {
      successHandlerWithToast("info", "Friendship Accepted.");
    },
    onError: (e: Error) => errorHandlerWithToast(e),
    mutationKey: ["acceptFriendship", `${ids.friendshipId}`],
  });
};
