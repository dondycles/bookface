import { Button } from "@/lib/components/ui/button";
import { Input } from "@/lib/components/ui/input";
import { ScrollArea } from "@/lib/components/ui/scroll-area";
import UserAvatar from "@/lib/components/user/user-avatar";
import { pusher } from "@/lib/pusher-client";
import {
  chatRoomChatsQueryOptions,
  chatRoomDataQueryOptions,
} from "@/lib/queries/messages";
import { userInfoQueryOptions } from "@/lib/queries/user";
import { sendMessage } from "@/lib/server/fn/messages";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Ellipsis, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
export const Route = createFileRoute("/m/$id")({
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

  const chatArea = useRef<HTMLDivElement>(null);

  const [message, setMessage] = useState("");
  const handleSubmitMessage = useMutation({
    mutationFn: async () =>
      await sendMessage({
        data: { chatRoomId: id, message, receiverId: chatMateId ?? "" },
      }),
    onSuccess: () => {
      queryClient.refetchQueries(chatRoomChats);
      setMessage("");
    },
  });
  useEffect(() => {
    if (!chatRoomChats.isFetching)
      chatArea.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatRoomChats.isFetching]);

  useEffect(() => {
    if (!currentUserInfo) return;
    pusher.subscribe(currentUserInfo.dB.id);
    pusher.bind(id, () => {
      queryClient.refetchQueries(chatRoomChats);
    });
    return () => {
      pusher.unsubscribe(currentUserInfo.dB.id);
    };
  }, [currentUserInfo, id, queryClient]);

  return (
    <div className="grid grid-flow-row-dense grid-rows-[81px_minmax(0px,1fr)_69px]   grid-cols-none flex-1 bg-muted rounded-md overflow-hidden">
      <div className="flex gap-2 items-start p-4 border-b h-fit">
        <div className="flex gap-2 flex-1">
          <UserAvatar
            className="size-12"
            url={chatMateData.data?.image}
            username={chatMateData.data?.username}
          />
          <p className="font-bold overflow-hidden text-ellipsis text-xl">
            {chatMateData.data?.name}
          </p>
        </div>
        <Button variant={"ghost"} size={"icon"}>
          <Ellipsis />
        </Button>
      </div>
      <ScrollArea>
        <div className="flex-1 p-4 overflow-auto space-y-4">
          {chatRoomChats.data
            ?.map((c) => {
              return (
                <div
                  key={c.id}
                  className={`bg-accent rounded-md p-2 w-fit ${c.senderId === currentUserInfo?.dB.id ? "mr-0 ml-auto" : "ml-0 mr-auto"}`}
                >
                  <p>{c.message}</p>
                </div>
              );
            })
            .reverse()}
          <div ref={chatArea} />
        </div>
      </ScrollArea>
      <div className="flex gap-2 p-4 border-t h-fit">
        <Input
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
