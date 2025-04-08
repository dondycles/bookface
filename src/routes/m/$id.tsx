import { Button } from "@/lib/components/ui/button";
import { Input } from "@/lib/components/ui/input";
import {
  chatRoomChatsQueryOptions,
  chatRoomDataQueryOptions,
} from "@/lib/queries/messages";
import { sendMessage } from "@/lib/server/fn/messages";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

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
  const [message, setMessage] = useState("");
  const handleSubmitMessage = useMutation({
    mutationFn: async () =>
      await sendMessage({
        data: { chatRoomId: id, message, receiverId: chatMateId ?? "" },
      }),
    onSuccess: () => {
      queryClient.refetchQueries(chatRoomChats);
    },
  });
  return (
    <>
      <div className="flex flex-col gap-4">
        {chatRoomChats.data
          ?.map((c) => {
            return (
              <p
                className={`bg-muted rounded-md p-2 w-fit ${c.senderId === currentUserInfo?.dB.id ? "mr-0 ml-auto" : "ml-0 mr-auto"}`}
                key={c.id}
              >
                {c.message}
              </p>
            );
          })
          .reverse()}
      </div>
      <Input
        value={message}
        onChange={(e) => setMessage(e.currentTarget.value)}
        placeholder="Message"
      />
      <Button onClick={() => handleSubmitMessage.mutate()}>Send</Button>
    </>
  );
}
