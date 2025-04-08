import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BellDot, Check, X } from "lucide-react";
import { useEffect } from "react";
import {
  useAcceptFriendshipRequestMutation,
  useRemoveFriendshipMutation,
} from "../mutations/friendship";
import { pusher } from "../pusher-client";
import { currentUserFriendshipsQueryOptions } from "../queries/friendship";
import { CurrentUserInfo } from "../server/fn/user";
import { getPendingReceivedFriendships } from "../utils";
import TimeInfo from "./time-info";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import UserAvatar from "./user/user-avatar";
import UserLink from "./user/user-link";

export default function NotificationDropdown({
  currentUserInfo,
}: {
  currentUserInfo: NonNullable<CurrentUserInfo>;
}) {
  const queryClient = useQueryClient();

  const friendships = useQuery({
    ...currentUserFriendshipsQueryOptions(),
  });
  const _pendingFriendships = getPendingReceivedFriendships(
    friendships.data ?? [],
    currentUserInfo?.dB.username ?? "",
  );

  useEffect(() => {
    if (!currentUserInfo) return;
    pusher.subscribe(currentUserInfo.dB.id);
    pusher.bind("friendships", () => {
      queryClient.invalidateQueries({
        queryKey: ["currentUserFriendships"],
      });
    });

    return () => {
      pusher.unsubscribe(`notifications${currentUserInfo.dB.id}`);
    };
  }, [currentUserInfo, queryClient]);

  return (
    <DropdownMenu key={"bell"}>
      <DropdownMenuTrigger asChild>
        <Button size={"icon"} variant={"ghost"}>
          {_pendingFriendships.length > 0 ? (
            <BellDot className="size-6" />
          ) : (
            <Bell className="size-6" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <p className="p-2">Notifications</p>
        <DropdownMenuSeparator />
        {_pendingFriendships.length > 0 ? (
          <div className="flex flex-col gap-[1px]">
            <p className="font-normal text-xs text-muted-foreground p-2">
              Pending Friendships ({_pendingFriendships.length})
            </p>
            {_pendingFriendships.map((f) => {
              return (
                <PendingFriendshipBar
                  currentUserInfo={currentUserInfo}
                  queryClient={queryClient}
                  key={f.id}
                  f={f}
                />
              );
            })}
          </div>
        ) : (
          <DropdownMenuItem>No notifications...</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PendingFriendshipBar({
  f,
  currentUserInfo,
  queryClient,
}: {
  f: ReturnType<typeof getPendingReceivedFriendships>[0];
  currentUserInfo: NonNullable<CurrentUserInfo>;
  queryClient: QueryClient;
}) {
  const handleRemoveFriendship = useRemoveFriendshipMutation({
    friendshipId: f.id,
    targetedUserId: f.requester,
    refetch: () => {
      queryClient.resetQueries({
        queryKey: ["friendship", `${currentUserInfo?.dB.id}${f.requester}`],
      });
      queryClient.invalidateQueries({
        queryKey: ["currentUserFriendships"],
      });
    },
  });

  const handleAcceptFriendshipRequest = useAcceptFriendshipRequestMutation({
    friendshipId: f.id,
    targetedUserId: f.requester,
    refetch: () => {
      queryClient.resetQueries({
        queryKey: ["friendship", `${currentUserInfo?.dB.id}${f.requester}`],
      });
      queryClient.invalidateQueries({
        queryKey: ["currentUserFriendships"],
      });
    },
  });
  return (
    <div
      key={f.id}
      className={`flex  gap-2 max-w-72 hover:bg-accent/50 rounded-md p-1 ${handleRemoveFriendship.isPending || (handleAcceptFriendshipRequest.isPending && "animate-pulse")}`}
    >
      <UserAvatar
        username={f.requesterInfo.username}
        url={f.requesterInfo.image}
        className="size-12"
      />
      <div className="flex flex-col gap-1 mb-auto mt-0">
        <div>
          <UserLink
            text={f.requesterInfo.name}
            username={f.requesterInfo.username ?? ""}
            className="overflow-hidden text-ellipsis line-clamp-1"
          />
        </div>
        <TimeInfo createdAt={f.createdAt} />
      </div>
      <div className={`flex gap-[1px] mb-0 mt-auto`}>
        <Button
          disabled={
            handleRemoveFriendship.isPending || handleAcceptFriendshipRequest.isPending
          }
          onClick={() => handleAcceptFriendshipRequest.mutate()}
          variant={"secondary"}
          className="rounded-r-none"
        >
          <Check />
        </Button>
        <Button
          disabled={
            handleRemoveFriendship.isPending || handleAcceptFriendshipRequest.isPending
          }
          onClick={() => handleRemoveFriendship.mutate()}
          variant={"destructive"}
          className="rounded-l-none"
        >
          <X />
        </Button>
      </div>
    </div>
  );
}
