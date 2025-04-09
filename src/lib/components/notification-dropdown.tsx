import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Bell, CheckCheck, Ellipsis, ExternalLink } from "lucide-react";
import { useEffect } from "react";
import { pusher } from "../pusher-client";
import { currentUserNotificationsQueryOptions } from "../queries/notifications";
import { readNotification } from "../server/fn/notification";
import { CurrentUserInfo } from "../server/fn/user";
import TimeInfo from "./time-info";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import UserAvatar from "./user/user-avatar";

export default function NotificationDropdown({
  currentUserInfo,
}: {
  currentUserInfo: NonNullable<CurrentUserInfo>;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
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
      <DropdownMenuContent
        align="end"
        className="max-w-96 max-h-[75dvh] flex-col flex gap-1"
      >
        <div className="p-2 flex items-center justify-between gap-2 text-muted-foreground ">
          <p>Notifications ({unread?.length})</p>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              hidden={notifications.data?.length === 0}
              showIcon={false}
            >
              <Ellipsis className="size-5" />
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>
                <CheckCheck /> Mark all as read
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ExternalLink /> View all notifications
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </div>
        {notifications.data?.length === 0 ? (
          <p className="text-center p-1 text-muted-foreground">...</p>
        ) : (
          <>
            <DropdownMenuSeparator className="my-0" />
            {notifications.data?.map((n) => {
              return (
                <DropdownMenuItem
                  onClick={async () => {
                    await readNotification({ data: { id: n.id } });
                    queryClient.invalidateQueries({
                      queryKey: ["currentUserNotifications"],
                    });

                    if (n.type === "acceptedfriendship" || n.type === "addfriendship") {
                      router.navigate({
                        to: "/$username/posts",
                        params: { username: n.notifierData.username! },
                        search: {
                          flow: "desc",
                          postsOrderBy: "recent",
                        },
                      });
                    }
                    if (n.type === "comment") {
                      router.navigate({
                        to: "/feed/$id",
                        params: { id: n.commentPostId },
                      });
                    }
                    if (n.type === "like") {
                      router.navigate({
                        to: "/feed/$id",
                        params: { id: n.likePostId },
                      });
                    }
                  }}
                  key={n.id}
                  className={`${n.isRead ? "" : "bg-accent/50"} p-2 items-start`}
                >
                  <UserAvatar
                    linkable={false}
                    username={n.notifierData.username}
                    url={n.notifierData.image}
                    className="size-10"
                  />
                  <div>
                    <p
                      className={`${n.isRead === false ? "text-foreground" : "text-muted-foreground"} `}
                    >
                      {n.notifierData.username}
                      {n.type === "addfriendship" && " sent your friendship request."}
                      {n.type === "acceptedfriendship" &&
                        " accepted your friendship request."}
                      {n.type === "comment" &&
                        ` commented "${n.commentMessage.slice(0, 10)}..." on your post.`}
                      {n.type === "like" && " liked on your post."}
                    </p>
                    <TimeInfo createdAt={n.createdAt} />
                  </div>
                </DropdownMenuItem>
              );
            })}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
