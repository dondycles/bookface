import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useEffect } from "react";
import { pusher } from "../pusher-client";
import { currentUserNotificationsQueryOptions } from "../queries/notifications";
import { readNotification } from "../server/fn/notification";
import { CurrentUserInfo } from "../server/fn/user";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import UserAvatar from "./user/user-avatar";

export default function NotificationDropdown({
  currentUserInfo,
}: {
  currentUserInfo: NonNullable<CurrentUserInfo>;
}) {
  const queryClient = useQueryClient();

  const notifications = useQuery(currentUserNotificationsQueryOptions());
  const unread = notifications.data?.filter((u) => u.isRead === false);
  useEffect(() => {
    if (!currentUserInfo) return;
    pusher.subscribe(currentUserInfo.dB.id);
    pusher.bind("notification", () => {
      queryClient.invalidateQueries({
        queryKey: ["currentUserNotifications"],
      });
    });

    return () => {
      pusher.unsubscribe(currentUserInfo.dB.id);
    };
  }, [currentUserInfo, queryClient]);

  return (
    <DropdownMenu key={"bell"}>
      <DropdownMenuTrigger asChild>
        <Button size={"icon"} variant={"ghost"} className="relative">
          <Bell className="size-6" />
          <p
            hidden={unread?.length === 0}
            className="absolute -top-1 right-1 text-destructive text-xs"
          >
            {unread?.length}
          </p>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[256px]">
        <p className="p-2">Notifications ({unread?.length})</p>
        <DropdownMenuSeparator />
        {notifications.data?.map((n) => {
          return (
            <DropdownMenuItem
              onClick={async () => {
                await readNotification({ data: { id: n.id } });
                queryClient.invalidateQueries({
                  queryKey: ["currentUserNotifications"],
                });
              }}
              key={n.id}
            >
              <UserAvatar
                linkable={false}
                username={n.notifierData.username}
                url={n.notifierData.image}
              />
              <p
                className={`${n.isRead === false ? "text-foreground" : "text-muted-foreground"} `}
              >
                {n.notifierData.username}
                {n.type === "addfriendship" && " sent your friendship request."}
                {n.type === "acceptedfriendship" && " accepted your friendship request."}
                {n.type === "comment" && " commented on your post."}
                {n.type === "like" && " liked on your post."}
              </p>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// function PendingFriendshipBar({
//   f,
//   currentUserInfo,
//   queryClient,
// }: {
//   f: ReturnType<typeof getPendingReceivedFriendships>[0];
//   currentUserInfo: NonNullable<CurrentUserInfo>;
//   queryClient: QueryClient;
// }) {
//   const handleRemoveFriendship = useRemoveFriendshipMutation({
//     friendshipId: f.id,
//     targetedUserId: f.requester,
//     refetch: () => {
//       queryClient.resetQueries({
//         queryKey: ["friendship", `${currentUserInfo?.dB.id}${f.requester}`],
//       });
//       queryClient.invalidateQueries({
//         queryKey: ["currentUserFriendships"],
//       });
//     },
//   });

//   const handleAcceptFriendshipRequest = useAcceptFriendshipRequestMutation({
//     friendshipId: f.id,
//     targetedUserId: f.requester,
//     refetch: () => {
//       queryClient.resetQueries({
//         queryKey: ["friendship", `${currentUserInfo?.dB.id}${f.requester}`],
//       });
//       queryClient.invalidateQueries({
//         queryKey: ["currentUserFriendships"],
//       });
//     },
//   });
//   return (
//     <div
//       key={f.id}
//       className={`flex  gap-2 max-w-72 hover:bg-accent/50 rounded-md p-1 ${handleRemoveFriendship.isPending || (handleAcceptFriendshipRequest.isPending && "animate-pulse")}`}
//     >
//       <UserAvatar
//         username={f.requesterInfo.username}
//         url={f.requesterInfo.image}
//         className="size-12"
//       />
//       <div className="flex flex-col gap-1 mb-auto mt-0">
//         <div>
//           <UserLink
//             text={f.requesterInfo.name}
//             username={f.requesterInfo.username ?? ""}
//             className="overflow-hidden text-ellipsis line-clamp-1"
//           />
//         </div>
//         <TimeInfo createdAt={f.createdAt} />
//       </div>
//       <div className={`flex gap-[1px] mb-0 mt-auto`}>
//         <Button
//           disabled={
//             handleRemoveFriendship.isPending || handleAcceptFriendshipRequest.isPending
//           }
//           onClick={() => handleAcceptFriendshipRequest.mutate()}
//           variant={"secondary"}
//           className="rounded-r-none"
//         >
//           <Check />
//         </Button>
//         <Button
//           disabled={
//             handleRemoveFriendship.isPending || handleAcceptFriendshipRequest.isPending
//           }
//           onClick={() => handleRemoveFriendship.mutate()}
//           variant={"destructive"}
//           className="rounded-l-none"
//         >
//           <X />
//         </Button>
//       </div>
//     </div>
//   );
// }
