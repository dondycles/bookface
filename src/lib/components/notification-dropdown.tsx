import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BellDot, Check, X } from "lucide-react";
import { useEffect } from "react";
import { pusher } from "../pusher-client";
import { currentUserFriendshipsQueryOptions } from "../queries/friendship";
import { CurrentUserInfo } from "../server/fn/user";
import { getPendingReceivedFriendships } from "../utils";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import UserAvatar from "./user-avatar";

export default function NotificationDropdown({
  currentUserInfo,
}: {
  currentUserInfo: NonNullable<CurrentUserInfo>;
}) {
  const queryClient = useQueryClient();

  const friendships = useQuery({ ...currentUserFriendshipsQueryOptions() });
  const _pendingFriendships = getPendingReceivedFriendships(
    friendships.data ?? [],
    currentUserInfo?.dB.username ?? "",
  );

  useEffect(() => {
    pusher.subscribe(`notifications${currentUserInfo.dB.id}`);
    pusher.bind("friendships", () => {
      queryClient.resetQueries({
        queryKey: ["currentUserFriendships"],
      });
    });

    return () => {
      pusher.unsubscribe(`notifications${currentUserInfo.dB.id}`);
    };
  }, []);
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
        {_pendingFriendships.length > 0 ? (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
              Pending friendships
            </DropdownMenuLabel>
            {_pendingFriendships.map((f) => {
              return (
                <DropdownMenuItem key={f.id}>
                  <UserAvatar
                    alt={f.requesterInfo.username ?? "User PFP"}
                    url={f.requesterInfo.image}
                  />
                  {f.requesterInfo.name}
                  <div className="flex gap-[1px]">
                    <Button variant={"secondary"} className="rounded-r-none">
                      <Check />
                    </Button>
                    <Button variant={"secondary"} className="rounded-l-none">
                      <X />
                    </Button>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        ) : (
          <DropdownMenuItem>No notifications...</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
