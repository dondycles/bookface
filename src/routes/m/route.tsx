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
    <div className="flex flex-row gap-4 pt-24 pb-12 sm:max-w-[512px] mx-auto h-full">
      <div className="hidden sm:flex flex-col gap-2 h-fit">
        {chatRoomIds.data?.map((c) => {
          return <ChatRoomEntryBar key={c.id} chatRoom={c} />;
        })}
      </div>
      <Outlet />
    </div>
  );
}

function ChatRoomEntryBar({ chatRoom }: { chatRoom: ChatRooms[0] }) {
  const { currentUserInfo } = Route.useRouteContext();
  // const chatRoomType: "group" | "private" =
  //   chatRoom.people.length === 2 ? "private" : "group";
  const chatMateId = chatRoom.people.filter((i) => i !== currentUserInfo?.dB.id)[0];
  const chatMateData = useQuery(userInfoQueryOptions(chatMateId, chatMateId));
  return (
    <MessageBtn
      className="flex-row justify-start flex-1 aspect-square md:aspect-auto"
      variant={"secondary"}
      targetedUserId={chatMateId}
    >
      <UserAvatar
        linkable={false}
        url={chatMateData.data?.image}
        username={chatMateData.data?.username}
      />
      <p className="hidden md:block">{chatMateData.data?.username}</p>
    </MessageBtn>
  );
}
