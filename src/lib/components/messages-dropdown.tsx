import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { Ellipsis, ExternalLink, MessageCircleMore, RotateCw } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { pusher } from "../pusher-client";
import { currentUserChatRoomIdsQueryOptions } from "../queries/messages";
import { notification } from "../schema";
import { CurrentUserInfo } from "../server/fn/user";
import { getPhrase } from "../utils";
import ChatRoomEntryBar from "./message-entry-bar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export default function MessageDropdown({
  currentUserInfo,
}: {
  currentUserInfo: NonNullable<CurrentUserInfo>;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const chatRoomIds = useQuery(currentUserChatRoomIdsQueryOptions());

  // const notifications = useQuery(currentUserTenNotificationsQueryOptions());
  // const unread = notifications.data?.filter((u) => u.isRead === false);

  // const handleReadNotifications = useMutation({
  //   mutationFn: async (ids: [string]) => await readNotification({ data: { ids } }),
  //   onSuccess: () => {
  //     notifications.refetch();
  //   },
  //   onError: (e: Error) => {
  //     errorHandlerWithToast(e);
  //   },
  // });

  const isPending = chatRoomIds.isLoading;
  useEffect(() => {
    if (!currentUserInfo) return;
    pusher.subscribe(currentUserInfo.dB.id);
    pusher.bind(
      "notification",
      (
        data: {
          notifierId: string;
          notifierUsername: string;
          type: typeof notification.$inferInsert.type;
          postId?: string;
          friendshipId?: string;
          commentId?: string;
          likeId?: string;
          commentMessage?: string;
        } | null,
      ) => {
        queryClient.invalidateQueries({
          queryKey: ["currentUserTenNotifications"],
        });
        if (data)
          toast(
            getPhrase({
              type: data.type,
              username: data.notifierUsername,
              commentMessage: data.commentMessage,
            }),
            {
              action: {
                label: "View",
                onClick: () => {
                  if (data.type === "acceptedfriendship" || data.type === "addfriendship")
                    router.navigate({
                      to: "/$username",
                      params: { username: data.notifierUsername },
                    });
                  if (data.type === "comment")
                    router.navigate({
                      to: "/feed/$id",
                      params: { id: data.postId! },
                    });
                  if (data.type === "like")
                    router.navigate({
                      to: "/feed/$id",
                      params: { id: data.postId! },
                    });
                },
              },
            },
          );
      },
    );

    return () => {
      pusher.unsubscribe(currentUserInfo.dB.id);
    };
  }, [currentUserInfo, queryClient]);

  return (
    <DropdownMenu key={"bell"}>
      <DropdownMenuTrigger asChild>
        <Button size={"icon"} variant={"ghost"} className="relative">
          <MessageCircleMore className="size-6" />
          {/* <p
            hidden={unread?.length === 0}
            className="absolute -top-1 right-1 text-destructive text-xs"
          >
            {unread?.length}
          </p> */}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={`min-w-fit w-screen max-w-96 max-h-[75dvh] flex-col flex gap-1 `}
      >
        <div className="p-2 flex items-center justify-between gap-2 text-muted-foreground ">
          <p>Messages </p>
          <Popover>
            <PopoverTrigger hidden={chatRoomIds.data?.length === 0}>
              <Ellipsis className="size-5" />
            </PopoverTrigger>
            <PopoverContent className="flex flex-col gap-0 p-1 w-fit">
              <Button
                disabled={isPending}
                variant={"ghost"}
                className="justify-start"
                onClick={() => {
                  chatRoomIds.refetch();
                }}
              >
                <RotateCw /> Refresh
              </Button>
              <Button asChild variant={"ghost"} className="justify-start">
                <Link to="/m">
                  <ExternalLink /> View all messages
                </Link>
              </Button>
            </PopoverContent>
          </Popover>
        </div>
        <DropdownMenuSeparator className="my-0" />
        {chatRoomIds.data?.map((c) => {
          return (
            <DropdownMenuItem disabled={isPending} key={c.id} asChild>
              <ChatRoomEntryBar
                currentUserInfo={currentUserInfo}
                key={c.id}
                chatRoom={c}
              />
            </DropdownMenuItem>
          );
        })}
        {/* {notifications.data?.length === 0 ? (
          <p className="text-center p-1 text-muted-foreground">...</p>
        ) : (
          <>
            <DropdownMenuSeparator className="my-0" />
            {notifications.data?.map((n) => {
              return (
                <DropdownMenuItem disabled={isPending} key={n.id} asChild>
                  <NotificationItemBar
                    key={n.id}
                    isPending={isPending}
                    n={n}
                    onClick={() => {
                      handleReadNotifications.mutate([n.id]);
                      navigateToNotif(n, router);
                    }}
                  />
                </DropdownMenuItem>
              );
            })}
          </>
        )} */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
