import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useEffect } from "react";
import { pusher } from "../pusher-client";
import { currentUserFriendshipsQueryOptions } from "../queries/friendship";
import { CurrentUserInfo } from "../server/fn/user";
import { getModifiedFriendships } from "../utils";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function NotificationDropdown({
  currentUserInfo,
}: {
  currentUserInfo: NonNullable<CurrentUserInfo>;
}) {
  const queryClient = useQueryClient();

  const friendships = useQuery({ ...currentUserFriendshipsQueryOptions() });
  const _friendships = getModifiedFriendships(
    friendships.data ?? [],
    currentUserInfo?.dB.username ?? "",
  );
  const pendingFriendships = _friendships.filter((f) => f.status === "pending");

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
          <Bell className="size-6" />
          {pendingFriendships.length}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Friendships</DropdownMenuLabel>
          {pendingFriendships.map((f) => {
            return <DropdownMenuItem key={f.id}>{f.info.name}</DropdownMenuItem>;
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
