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
  refetch,
}: {
  currentUserId: string;
  targetedUserId: string;
  refetch: () => void;
}) => {
  return useMutation({
    mutationFn: async () => {
      return await addFriendshipRequest({ data: { receiverId: targetedUserId } });
    },
    onSuccess: () => {
      successHandlerWithToast("info", "Friendship Requested.");
      refetch();
    },
    onError: (e: Error) => {
      errorHandlerWithToast(e);
      refetch();
    },
    mutationKey: ["addFriendship", `${currentUserId}${targetedUserId}`],
  });
};

export const useRemoveFriendshipMutation = ({
  friendshipId,
}: {
  friendshipId: string;
}) => {
  return useMutation({
    mutationFn: async () => {
      return await removeFriendship({
        data: { friendshipId },
      });
    },
    onSuccess: () => {
      successHandlerWithToast("info", "Friendship Cancelled.");
    },
    onError: (e: Error) => errorHandlerWithToast(e),
    mutationKey: ["removeFriendship", `${friendshipId}`],
  });
};

export const useAcceptFriendshipRequestMutation = ({
  friendshipId,
}: {
  friendshipId: string;
}) => {
  return useMutation({
    mutationFn: async () => {
      return await acceptFriendshipRequest({
        data: { friendshipId },
      });
    },
    onSuccess: () => {
      successHandlerWithToast("info", "Friendship Accepted.");
    },
    onError: (e: Error) => errorHandlerWithToast(e),
    mutationKey: ["acceptFriendship", `${friendshipId}`],
  });
};
