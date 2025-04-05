import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, Check, Ellipsis, Flag, MessageCircle, Plus, X } from "lucide-react";
import { thisFriendshipQueryOptions } from "../queries/friendship";
import { addFriendshipRequest, removeFriendshipRequest } from "../server/fn/friendships";
import { CurrentUserInfo } from "../server/fn/user";
import { cn, errorHandlerWithToast, successHandlerWithToast } from "../utils";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function UserOptionsBtns({
  currentUserInfo,
  targetedUserId,
  className,
}: {
  currentUserInfo: CurrentUserInfo;
  targetedUserId: string;
  className?: string;
}) {
  const queryClient = useQueryClient();

  const friendship = useQuery(
    thisFriendshipQueryOptions(targetedUserId, currentUserInfo?.dB.id ?? ""),
  );

  const friendshipStatus = friendship.data?.status;
  const iAmTheReceiver = friendship.data?.receiver === currentUserInfo?.dB.id;

  const handleAddFriendshipRequest = useMutation({
    mutationFn: async () => {
      return await addFriendshipRequest({ data: { receiverId: targetedUserId } });
    },
    onSuccess: () => {
      successHandlerWithToast("info", "Friendship Requested.");
      queryClient.resetQueries({
        queryKey: ["friendship", `${currentUserInfo?.dB.id}${targetedUserId}`],
      });
      friendship.refetch();
    },
    onError: (e: Error) => errorHandlerWithToast(e),
  });

  const handleRemoveFriendshipRequest = useMutation({
    mutationFn: async () => {
      return await removeFriendshipRequest({ data: { receiverId: targetedUserId } });
    },
    onSuccess: () => {
      successHandlerWithToast("info", "Friendship Cancelled.");
      queryClient.resetQueries({
        queryKey: ["friendship", `${currentUserInfo?.dB.id}${targetedUserId}`],
      });
    },
    onError: (e: Error) => errorHandlerWithToast(e),
  });

  const handleAcceptFriendshipRequest = useMutation({
    mutationFn: async () => {
      return await removeFriendshipRequest({ data: { receiverId: targetedUserId } });
    },
    onSuccess: () => {
      successHandlerWithToast("info", "Friendship Cancelled.");
      queryClient.resetQueries({
        queryKey: ["friendship", `${currentUserInfo?.dB.id}${targetedUserId}`],
      });
    },
    onError: (e: Error) => errorHandlerWithToast(e),
  });
  return (
    <div className={cn("flex gap-2", className)}>
      <Button
        disabled={friendship.isFetching}
        className={`${friendship.isFetching ? "animate-pulse " : ""} flex-1`}
        onClick={() => {
          if (friendshipStatus === "pending") {
            if (iAmTheReceiver) {
              handleAcceptFriendshipRequest.mutate();
            } else {
              handleRemoveFriendshipRequest.mutate();
            }
          } else if (friendshipStatus === "accepted") {
            handleRemoveFriendshipRequest.mutate();
          } else {
            handleAddFriendshipRequest.mutate();
          }
        }}
      >
        {(() => {
          if (!friendshipStatus) return <Plus />;
          if (friendshipStatus === "accepted") return <X />;
          if (friendshipStatus === "pending") {
            return iAmTheReceiver ? <Check /> : <X />;
          }
          return <Plus />;
        })()}

        {(() => {
          if (!friendshipStatus) return "Add Friend";
          if (friendshipStatus === "accepted") return "Remove Friend";
          if (friendshipStatus === "pending") {
            return iAmTheReceiver ? "Accept Friend" : "Cancel Request";
          }
          return "Add Friend";
        })()}
      </Button>
      <Button variant={"secondary"} className="  flex-1">
        <MessageCircle />
        Message
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"secondary"}>
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Ban /> Block
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Flag /> Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
