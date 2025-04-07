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

  const handleAddFriendshipRequest = useAddFriendshipRequestMutation({
    currentUserId: currentUserInfo?.dB.id ?? "",
    queryClient,
    refetch: () => friendship.refetch(),
    targetedUserId,
    queryKey: ["friendship", `${currentUserInfo?.dB.id}${targetedUserId}`],
    refetchOption: "reset",
  });

  const handleRemoveFriendship = useRemoveFriendshipMutation({
    queryClient,
    ids: {
      friendshipId: friendship.data?.id ?? "",
      updateReceiverId: iAmTheReceiver
        ? (friendship.data?.requester ?? "")
        : (friendship.data?.requester ?? ""),
    },
    queryKey: ["friendship", `${friendship.data?.id}`],
    refetchOption: "reset",
  });

  const handleAcceptFriendshipRequest = useAcceptFriendshipRequestMutation({
    queryClient,
    ids: {
      friendshipId: friendship.data?.id ?? "",
      updateReceiverId: iAmTheReceiver
        ? (friendship.data?.requester ?? "")
        : (friendship.data?.receiver ?? ""),
    },
    queryKey: ["friendship", `${friendship.data?.id}`],
    refetchOption: "reset",
  });

  useEffect(() => {
    if (!currentUserInfo) return;

    pusher.subscribe(friendship.data?.id ?? `${currentUserInfo.dB.id}${targetedUserId}`);

    pusher.bind(`addFriend${currentUserInfo.dB.id}`, () => {
      alert("addFriend");
      friendship.refetch();
    });

    pusher.bind(`acceptFriend${currentUserInfo.dB.id}`, () => {
      alert("acceptFriend");
      friendship.refetch();
    });

    pusher.bind(`removeFriend${currentUserInfo.dB.id}`, () => {
      alert("removeFriend");
      friendship.refetch();
    });

    return () => {
      pusher.unsubscribe(
        friendship.data?.id ?? `${currentUserInfo?.dB.id}${targetedUserId}`,
      );
    };
  }, [friendship.data, currentUserInfo]);

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
          disabled={friendship.isFetching}
          className={`${friendship.isFetching ? "animate-pulse " : ""} flex-1 rounded-r-none`}
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
