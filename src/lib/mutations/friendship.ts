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
  targetedUserId,
  refetch,
}: {
  friendshipId: string;
  targetedUserId: string;
  refetch: () => void;
}) => {
  return useMutation({
    mutationFn: async () => {
      return await removeFriendship({
        data: { friendshipId, targetedUserId },
      });
    },
    onSuccess: () => {
      successHandlerWithToast("info", "Friendship Cancelled.");
      refetch();
    },
    onError: (e: Error) => {
      errorHandlerWithToast(e);
      refetch();
    },
    mutationKey: ["removeFriendship", `${friendshipId}`],
  });
};

export const useAcceptFriendshipRequestMutation = ({
  friendshipId,
  targetedUserId,
  refetch,
}: {
  friendshipId: string;
  targetedUserId: string;
  refetch: () => void;
}) => {
  return useMutation({
    mutationFn: async () => {
      return await acceptFriendshipRequest({
        data: { friendshipId, targetedUserId },
      });
    },
    onSuccess: () => {
      successHandlerWithToast("info", "Friendship Accepted.");
      refetch();
    },
    onError: (e: Error) => {
      errorHandlerWithToast(e);
      refetch();
    },
    mutationKey: ["acceptFriendship", `${friendshipId}`],
  });
};
