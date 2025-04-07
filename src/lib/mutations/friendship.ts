import { QueryClient, useMutation } from "@tanstack/react-query";
import {
  acceptFriendshipRequest,
  addFriendshipRequest,
  removeFriendship,
} from "../server/fn/friendships";
import { errorHandlerWithToast, successHandlerWithToast } from "../utils";

export const useAddFriendshipRequestMutation = ({
  queryClient,
  refetch,
  currentUserId,
  targetedUserId,
  queryKey,
  refetchOption,
}: {
  queryClient: QueryClient;
  refetch: () => void;
  currentUserId: string;
  targetedUserId: string;
  queryKey: string[];
  refetchOption: "reset" | "invalidate";
}) => {
  return useMutation({
    mutationFn: async () => {
      return await addFriendshipRequest({ data: { receiverId: targetedUserId } });
    },
    onSuccess: () => {
      successHandlerWithToast("info", "Friendship Requested.");
      if (refetchOption === "invalidate")
        queryClient.invalidateQueries({
          queryKey,
        });
      if (refetchOption === "reset")
        queryClient.resetQueries({
          queryKey,
        });
      refetch();
    },
    onError: (e: Error) => errorHandlerWithToast(e),
    mutationKey: ["addFriendship", `${currentUserId}${targetedUserId}`],
  });
};

export const useRemoveFriendshipMutation = ({
  queryClient,
  friendshipId,
  queryKey,
  refetchOption,
}: {
  queryClient: QueryClient;
  friendshipId: string;
  queryKey: string[];
  refetchOption: "reset" | "invalidate";
}) => {
  return useMutation({
    mutationFn: async () => {
      return await removeFriendship({ data: friendshipId });
    },
    onSuccess: () => {
      successHandlerWithToast("info", "Friendship Cancelled.");
      if (refetchOption === "invalidate")
        queryClient.invalidateQueries({
          queryKey,
        });
      if (refetchOption === "reset")
        queryClient.resetQueries({
          queryKey,
        });
    },
    onError: (e: Error) => errorHandlerWithToast(e),
    mutationKey: ["removeFriendship", `${friendshipId}`],
  });
};

export const useAcceptFriendshipRequestMutation = ({
  queryClient,
  friendshipId,
  queryKey,
  refetchOption,
}: {
  queryClient: QueryClient;
  friendshipId: string;
  queryKey: string[];
  refetchOption: "reset" | "invalidate";
}) => {
  return useMutation({
    mutationFn: async () => {
      return await acceptFriendshipRequest({ data: friendshipId });
    },
    onSuccess: () => {
      successHandlerWithToast("info", "Friendship Cancelled.");
      if (refetchOption === "invalidate")
        queryClient.invalidateQueries({
          queryKey,
        });
      if (refetchOption === "reset")
        queryClient.resetQueries({
          queryKey,
        });
    },
    onError: (e: Error) => errorHandlerWithToast(e),
    mutationKey: ["acceptFriendship", `${friendshipId}`],
  });
};
