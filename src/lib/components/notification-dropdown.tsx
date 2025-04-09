import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Bell, CheckCheck, Ellipsis, ExternalLink, RotateCw } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { pusher } from "../pusher-client";
import { currentUserTenNotificationsQueryOptions } from "../queries/notifications";
import { notification } from "../schema";
import { readNotification } from "../server/fn/notification";
import { CurrentUserInfo } from "../server/fn/user";
import TimeInfo from "./time-info";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import UserAvatar from "./user/user-avatar";

export default function NotificationDropdown({
  currentUserInfo,
}: {
  currentUserInfo: NonNullable<CurrentUserInfo>;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const notifications = useQuery({ ...currentUserTenNotificationsQueryOptions() });
  const unread = notifications.data?.filter((u) => u.isRead === false);

  // const [readyToNotify, setReadyToNotift] = useState(false);

  // useEffect(() => {
  //   if (!readyToNotify) return;
  //   if (!unread) return;
  //   const latestNotif = unread[0];
  //   toast(latestNotif.type);
  // }, [readyToNotify, unread]);

  useEffect(() => {
    if (!currentUserInfo) return;
    pusher.subscribe(currentUserInfo.dB.id);
    pusher.bind(
      "notification",
      (data: {
        receiverId: string;
        type: typeof notification.$inferInsert.type;
        postId?: string;
        friendshipId?: string;
        commentId?: string;
        likeId?: string;
      }) => {
        queryClient.invalidateQueries({
          queryKey: ["currentUserTenNotifications"],
        });
        // setReadyToNotift(true);
        toast(data.type);
      },
    );

    return () => {
      pusher.unsubscribe(currentUserInfo.dB.id);
      // setReadyToNotift(false);
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
          <Popover>
            <PopoverTrigger hidden={notifications.data?.length === 0}>
              <Ellipsis className="size-5" />
            </PopoverTrigger>
            <PopoverContent className="flex flex-col gap-0 p-1 w-fit">
              <Button variant={"ghost"} className="justify-start">
                <CheckCheck /> Mark all as read
              </Button>
              <Button
                disabled={notifications.isFetching}
                variant={"ghost"}
                className="justify-start"
                onClick={() => {
                  notifications.refetch();
                }}
              >
                <RotateCw /> Refresh
              </Button>
              <Button variant={"ghost"} className="justify-start">
                <ExternalLink /> View all notifications
              </Button>
            </PopoverContent>
          </Popover>
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
                      queryKey: ["currentUserTenNotifications"],
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
