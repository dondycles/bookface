import { Button } from "@/lib/components/ui/button";
import { ScrollArea } from "@/lib/components/ui/scroll-area";
import { Skeleton } from "@/lib/components/ui/skeleton";
import { Textarea } from "@/lib/components/ui/textarea";
import UserAvatar from "@/lib/components/user/user-avatar";
import { pusher } from "@/lib/pusher-client";
import {
  chatRoomChatsQueryOptions,
  chatRoomDataQueryOptions,
} from "@/lib/queries/messages";
import { userInfoQueryOptions } from "@/lib/queries/user";
import { seenMessage, sendMessage } from "@/lib/server/fn/messages";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Ellipsis, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
export const Route = createFileRoute("/m/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { queryClient, currentUserInfo } = Route.useRouteContext();
  const chatRoomData = useQuery(chatRoomDataQueryOptions(id));
  const chatRoomChats = useQuery(chatRoomChatsQueryOptions(id));
  const chatMateId = chatRoomData.data?.people.filter(
    (i) => i !== currentUserInfo?.dB.id,
  )[0];

  const chatMateData = useQuery(userInfoQueryOptions(chatMateId!, chatMateId));
  const myLastSeen = chatRoomData.data?.lastSeen?.find(
    (l) => l.userId === currentUserInfo?.dB.id,
  );
  const chatMateSeen = chatRoomData.data?.lastSeen?.find((l) => l.userId === chatMateId);
  const chatArea = useRef<HTMLDivElement>(null);

  const [message, setMessage] = useState("");
  const handleSubmitMessage = useMutation({
    mutationFn: async () => {
      if (chatRoomData.data)
        await sendMessage({
          data: {
            chatRoomData: chatRoomData.data,
            message,
            receiverId: chatMateId ?? "",
          },
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(chatRoomChats);
      queryClient.invalidateQueries({ queryKey: ["chatRoom", chatRoomData.data?.id] });
      queryClient.invalidateQueries({
        queryKey: ["latestMessage", chatRoomData.data?.id],
      });
      setMessage("");
    },
  });

  useEffect(() => {
    if (!chatRoomChats.isFetching) {
      chatArea.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatRoomChats.isFetching]);

  // useEffect(() => {
  //   if (!chatRoomData.data) return;
  //   if (!chatRoomChats.data) return;
  //   if (!chatMateData.data) return;
  //   if (myLastSeen?.lastSeenMessageId === chatRoomChats.data[0].id) return;
  //   if (!chatRoomData.isFetching) {
  //     // alert("seen my message");
  //     seenMessage({
  //       data: {
  //         chatRoomData: chatRoomData.data,
  //         messageId: chatRoomChats.data[0].id,
  //         receiverId: chatMateData.data.id,
  //       },
  //     });
  //   }
  // }, [
  //   chatMateData.data,
  //   chatRoomChats.data,
  //   chatRoomData.data,
  //   chatRoomData.isFetching,
  //   myLastSeen?.lastSeenMessageId,
  // ]);

  useEffect(() => {
    if (!currentUserInfo) return;
    pusher.subscribe(currentUserInfo.dB.id);
    pusher.bind(id, () => {
      queryClient.invalidateQueries({
        queryKey: ["chatRoomChats", id],
      });
      queryClient.invalidateQueries({ queryKey: ["chatRoom", chatRoomData.data?.id] });
      queryClient.invalidateQueries({
        queryKey: ["latestMessage", chatRoomData.data?.id],
      });
    });
    return () => {
      pusher.unsubscribe(currentUserInfo.dB.id);
    };
  }, [id, queryClient, currentUserInfo, chatRoomData.data?.id]);

  if (chatRoomChats.isLoading)
    return (
      <Skeleton className="h-full flex-1 rounded-none">
        <Skeleton className="h-[81px] rounded-none p-4">
          <Skeleton className="size-12 rounded-full" />
        </Skeleton>
      </Skeleton>
    );
  return (
    <div
      onClick={async () => {
        if (!chatRoomData.data) return;
        if (!chatRoomChats.data) return;
        if (!chatMateData.data) return;
        if (myLastSeen?.lastSeenMessageId === chatRoomChats.data[0].id) return;
        await seenMessage({
          data: {
            chatRoomData: chatRoomData.data,
            messageId: chatRoomChats.data[0].id,
            receiverId: chatMateData.data?.id,
          },
        });
      }}
      className="h-full grid grid-rows-[81px_minmax(0px,1fr)_144px]   grid-cols-none flex-1 bg-muted overflow-hidden"
    >
      <div className="flex gap-2 items-center justify-center px-2 py-4 border-b h-fit">
        <div className="flex flex-row gap-2 flex-1 items-center">
          <Link to="/m">
            <ChevronLeft />
          </Link>
          <UserAvatar
            className="size-12"
            url={chatMateData.data?.image}
            username={chatMateData.data?.username}
          />
          <div>
            <p className="font-bold overflow-hidden text-ellipsis line-clamp-1 text-xl leading-tight h-fit">
              {chatMateData.data?.name}
            </p>
            <p className="overflow-hidden text-ellipsis line-clamp-1 leading-tight h-fit text-sm text-muted-foreground">
              @{chatMateData.data?.username}
            </p>
          </div>
        </div>
        <Button variant={"ghost"} size={"icon"}>
          <Ellipsis />
        </Button>
      </div>
      <ScrollArea>
        <div className="flex-1 p-2 overflow-auto space-y-1">
          {chatRoomChats.data
            ?.map((c) => {
              return (
                <div
                  key={c.id}
                  className={`bg-accent rounded-md p-2 w-fit ${c.senderId === currentUserInfo?.dB.id ? "mr-0 ml-auto" : "ml-0 mr-auto"}`}
                >
                  {/* <p className="text-xs text-muted-foreground">{c.id}</p> */}
                  <p className="whitespace-pre-wrap">{c.message}</p>
                  <p
                    hidden={chatMateSeen?.lastSeenMessageId !== c.id}
                    className="text-xs text-muted-foreground"
                  >
                    seen
                  </p>
                </div>
              );
            })
            .reverse()}
          <div ref={chatArea} />
        </div>
      </ScrollArea>
      {/* <p>My Last Seen: {JSON.stringify(myLastSeen)}</p>
      <p>Chat Mate Last Seen: {JSON.stringify(chatMateSeen)}</p> */}
      <div className="flex gap-2 p-2 border-t h-fit">
        <Textarea
          className="resize-none field-sizing-fixed scrollbar scrollbar-thumb-accent"
          value={message}
          onChange={(e) => setMessage(e.currentTarget.value)}
          placeholder="Message"
        />
        <Button
          size={"icon"}
          variant={"secondary"}
          onClick={() => handleSubmitMessage.mutate()}
        >
          <Send />
        </Button>
      </div>
    </div>
  );
}
