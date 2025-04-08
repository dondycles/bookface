import MessageBtn from "@/lib/components/message-btn";
import UserAvatar from "@/lib/components/user/user-avatar";
import { currentUserChatRoomIdsQueryOptions } from "@/lib/queries/messages";
import { userInfoQueryOptions } from "@/lib/queries/user";
import { ChatRooms } from "@/lib/server/fn/messages";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/m")({
  component: RouteComponent,
});

function RouteComponent() {
  const chatRoomIds = useSuspenseQuery(currentUserChatRoomIdsQueryOptions());
  return (
    <div className="flex flex-col gap-4 py-24 sm:max-w-[512px] mx-auto">
      {chatRoomIds.data?.map((c) => {
        return <ChatRoomEntryBar key={c.id} chatRoom={c} />;
      })}
      <Outlet />
    </div>
  );
}

function ChatRoomEntryBar({ chatRoom }: { chatRoom: ChatRooms[0] }) {
  const { currentUserInfo } = Route.useRouteContext();
  const chatMateId = chatRoom.people.filter((i) => i !== currentUserInfo?.dB.id)[0];
  const chatMateData = useQuery(userInfoQueryOptions(chatMateId, chatMateId));
  return (
    <MessageBtn
      className="h-fit justify-baseline"
      variant={"secondary"}
      targetedUserId={chatMateId}
    >
      <UserAvatar url={chatMateData.data?.image} username={chatMateData.data?.username} />
      {chatMateData.data?.username}
    </MessageBtn>
  );
}
