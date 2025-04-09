import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, Check, Ellipsis, Flag, Plus, Star, X } from "lucide-react";
import {
  useAcceptFriendshipRequestMutation,
  useAddFriendshipRequestMutation,
  useRemoveFriendshipMutation,
} from "../../mutations/friendship";
import { thisFriendshipQueryOptions } from "../../queries/friendship";
import { CurrentUserInfo } from "../../server/fn/user";
import { cn } from "../../utils";
import MessageBtn from "../message-btn";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export default function UserFriendshipOptionsBtns({
  currentUserInfo,
  targetedUserId,
  className,
  asPopover = false,
}: {
  currentUserInfo: CurrentUserInfo;
  targetedUserId: string;
  className?: string;
  asPopover?: boolean;
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

  const pending =
    handleAcceptFriendshipRequest.isPending ||
    handleRemoveFriendship.isPending ||
    handleAddFriendshipRequest.isPending;

  return (
    <div className={cn("flex rounded-md gap-[1px]", className)}>
      {friendshipStatus === "accepted" ? (
        <>
          {asPopover ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button disabled={pending} className="flex-1 rounded-r-none">
                  <Check />
                  Friends
                </Button>
              </PopoverTrigger>
              <PopoverContent className="flex flex-col gap-1 p-1 w-32">
                <Button
                  disabled={pending}
                  variant={"ghost"}
                  onClick={() => handleRemoveFriendship.mutate()}
                >
                  <X />
                  Unfriend
                </Button>
                <Button disabled={pending} variant={"ghost"}>
                  <Star />
                  Favorite
                </Button>
              </PopoverContent>
            </Popover>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={pending} className="flex-1 rounded-r-none">
                  <Check />
                  Friends
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  disabled={pending}
                  onClick={() => handleRemoveFriendship.mutate()}
                >
                  <X />
                  Unfriend
                </DropdownMenuItem>
                <DropdownMenuItem disabled={pending}>
                  <Star />
                  Favorite
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </>
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

      <MessageBtn
        targetedUserId={targetedUserId}
        variant={"secondary"}
        className="rounded-none flex-1"
      />
      {asPopover ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button disabled={pending} variant={"secondary"} className="rounded-l-none">
              <Ellipsis />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="flex flex-col gap-1 p-1 w-32">
            <Button disabled={pending} variant={"ghost"}>
              <Ban /> Block
            </Button>
            <Button disabled={pending} variant={"ghost"}>
              <Flag /> Report
            </Button>
          </PopoverContent>
        </Popover>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button disabled={pending} variant={"secondary"} className="rounded-l-none">
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled={pending}>
              <Ban /> Block
            </DropdownMenuItem>
            <DropdownMenuItem disabled={pending}>
              <Flag /> Report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
