import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { pusher } from "../pusher-client";
import {
  chatRoomDataQueryOptions,
  chatRoomLatestMessageQueryOptions,
} from "../queries/messages";
import { userInfoQueryOptions } from "../queries/user";
import { ChatRooms } from "../server/fn/messages";
import { CurrentUserInfo } from "../server/fn/user";
import { cn } from "../utils";
import MessageBtn from "./message-btn";
import UserAvatar from "./user/user-avatar";

export default function ChatRoomEntryBar({
  chatRoom,
  currentUserInfo,
  className,
}: {
  chatRoom: ChatRooms[0];
  currentUserInfo: CurrentUserInfo;
  className?: string;
}) {
  const pathname = useRouterState().location.pathname;
  const queryClient = useQueryClient();
  // const chatRoomType: "group" | "private" =
  //   chatRoom.people.length === 2 ? "private" : "group";
  const chatRoomData = useQuery({
    initialData: chatRoom,
    ...chatRoomDataQueryOptions(chatRoom.id),
  });

  const chatMateId = chatRoom.people.filter((i) => i !== currentUserInfo?.dB.id)[0];
  const chatMateData = useQuery(userInfoQueryOptions(chatMateId, chatMateId));
  const chatLatestMessage = useQuery(chatRoomLatestMessageQueryOptions(chatRoom.id));
  const myLatestSeen = chatRoom.lastSeen?.find(
    (l) => l.userId === currentUserInfo?.dB.id,
  );
  const isSeen = myLatestSeen?.lastSeenMessageId === chatLatestMessage.data?.id;

  useEffect(() => {
    if (!currentUserInfo) return;
    pusher.subscribe(currentUserInfo.dB.id);
    pusher.bind(chatRoom.id, () => {
      queryClient.invalidateQueries({ queryKey: ["chatRoom", chatRoomData.data?.id] });
      queryClient.invalidateQueries({
        queryKey: ["latestMessage", chatRoomData.data?.id],
      });
    });
    return () => {
      pusher.unsubscribe(currentUserInfo.dB.id);
    };
  }, [queryClient, currentUserInfo, chatRoomData.data?.id, chatRoom.id]);

  if (chatMateData.isLoading) return;
  return (
    <MessageBtn
      className={cn(`flex-row bg-muted p-2 justify-start flex-1 rounded-md`, className)}
      variant={"secondary"}
      targetedUserId={chatMateId}
    >
      <UserAvatar
        linkable={false}
        url={chatMateData.data?.image}
        username={chatMateData.data?.username}
        className="size-14"
      />
      <div className="flex flex-col flex-1 items-start">
        <p className={`text-lg ${pathname === "/m" ? "" : "hidden md:block"}`}>
          {chatMateData.data?.username}
        </p>
        <p className={`${isSeen ? "text-muted-foreground" : ""}`}>
          {chatLatestMessage.data?.senderId === currentUserInfo?.dB.id && "You: "}
          {chatLatestMessage?.data?.message}
        </p>
      </div>
    </MessageBtn>
  );
}
