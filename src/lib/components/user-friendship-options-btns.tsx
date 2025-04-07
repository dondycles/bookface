import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, Check, Ellipsis, Flag, MessageCircle, Plus, Star, X } from "lucide-react";
import { useEffect } from "react";
import {
  useAcceptFriendshipRequestMutation,
  useAddFriendshipRequestMutation,
  useRemoveFriendshipMutation,
} from "../mutations/friendship";
import { pusher } from "../pusher-client";
import { thisFriendshipQueryOptions } from "../queries/friendship";
import { CurrentUserInfo } from "../server/fn/user";
import { cn } from "../utils";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function UserFriendshipOptionsBtns({
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
    thisFriendshipQueryOptions(targetedUserId, currentUserInfo?.dB.id as string),
  );

  const friendshipStatus = friendship.data?.status;

  const iAmTheReceiver = friendship.data?.receiver === currentUserInfo?.dB.id;

  const handleAddFriendshipRequest = useAddFriendshipRequestMutation({
    currentUserId: currentUserInfo?.dB.id as string,
    targetedUserId,
    refetch: () => {
      friendship.refetch();
      queryClient.invalidateQueries({
        queryKey: ["currentUserFriendships"],
      });
    },
  });

  const handleRemoveFriendship = useRemoveFriendshipMutation({
    friendshipId: friendship.data?.id as string,
    targetedUserId,
    refetch: () => {
      queryClient.resetQueries({
        queryKey: ["friendship", `${currentUserInfo?.dB.id}${targetedUserId}`],
      });
      queryClient.invalidateQueries({
        queryKey: ["currentUserFriendships"],
      });
    },
  });

  const handleAcceptFriendshipRequest = useAcceptFriendshipRequestMutation({
    friendshipId: friendship.data?.id as string,
    targetedUserId,
    refetch: () => {
      queryClient.resetQueries({
        queryKey: ["friendship", `${currentUserInfo?.dB.id}${targetedUserId}`],
      });
      queryClient.invalidateQueries({
        queryKey: ["currentUserFriendships"],
      });
    },
  });

  useEffect(() => {
    if (!currentUserInfo) return;
    pusher.subscribe(currentUserInfo.dB.id);
    pusher.bind("friendships", () => {
      queryClient.resetQueries({
        queryKey: ["friendship", `${currentUserInfo.dB.id}${targetedUserId}`],
      });
      queryClient.invalidateQueries({
        queryKey: ["currentUserFriendships"],
      });
    });

    return () => {
      pusher.unsubscribe(`notifications${currentUserInfo?.dB.id}`);
    };
  }, [currentUserInfo, queryClient, targetedUserId]);

  return (
    <div className={cn("flex rounded-md gap-[1px]", className)}>
      {friendshipStatus === "accepted" ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="flex-1 rounded-r-none">
              <Check />
              Friends
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => handleRemoveFriendship.mutate()}>
              <X />
              Unfriend
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Star />
              Favorite
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          disabled={
            friendship.isFetching ||
            handleAcceptFriendshipRequest.isPending ||
            handleRemoveFriendship.isPending ||
            handleAddFriendshipRequest.isPending
          }
          className={`${
            friendship.isFetching ||
            handleAcceptFriendshipRequest.isPending ||
            handleRemoveFriendship.isPending ||
            handleAddFriendshipRequest.isPending
              ? "animate-pulse "
              : ""
          } flex-1 rounded-r-none`}
          onClick={() => {
            if (friendshipStatus === "pending") {
              if (iAmTheReceiver) {
                handleAcceptFriendshipRequest.mutate();
              } else {
                handleRemoveFriendship.mutate();
              }
            } else {
              handleAddFriendshipRequest.mutate();
            }
          }}
        >
          {(() => {
            if (!friendshipStatus) return <Plus />;
            if (friendshipStatus === "pending") {
              return iAmTheReceiver ? <Check /> : <X />;
            }
            return <Plus />;
          })()}

          {(() => {
            if (!friendshipStatus) return "Add Friend";
            if (friendshipStatus === "pending") {
              return iAmTheReceiver ? "Accept Friend" : "Cancel Request";
            }
            return "Add Friend";
          })()}
        </Button>
      )}

      <Button variant={"secondary"} className="rounded-none flex-1">
        <MessageCircle />
        Message
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"secondary"} className="rounded-l-none">
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
