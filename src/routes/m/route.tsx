import MessageBtn from "@/lib/components/message-btn";
import { Skeleton } from "@/lib/components/ui/skeleton";
import UserAvatar from "@/lib/components/user/user-avatar";
import { currentUserChatRoomIdsQueryOptions } from "@/lib/queries/messages";
import { userInfoQueryOptions } from "@/lib/queries/user";
import { ChatRooms } from "@/lib/server/fn/messages";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Outlet,
  useMatchRoute,
  useRouterState,
} from "@tanstack/react-router";

export const Route = createFileRoute("/m")({
  component: RouteComponent,
});

function RouteComponent() {
  const chatRoomIds = useSuspenseQuery(currentUserChatRoomIdsQueryOptions());
  const matchRoute = useMatchRoute();
  return (
    <div className="pt-20 sm:max-w-[512px] mx-auto h-full">
      <p
        hidden={!matchRoute({ to: "/m", fuzzy: false })}
        className="text-2xl font-bold px-2 py-4"
      >
        Messages
      </p>
      <div
        hidden={!matchRoute({ to: "/m", fuzzy: false })}
        className={`flex flex-col h-fit flex-1 gap-0 sm:gap-2`}
      >
        {chatRoomIds.isLoading ? (
          <>
            <Skeleton className="w-full h-10" />
            <Skeleton className="w-full h-10" />
          </>
        ) : (
          chatRoomIds.data?.map((c) => {
            return <ChatRoomEntryBar key={c.id} chatRoom={c} />;
          })
        )}
      </div>
      <Outlet />
    </div>
  );
}

function ChatRoomEntryBar({ chatRoom }: { chatRoom: ChatRooms[0] }) {
  const { currentUserInfo } = Route.useRouteContext();
  const pathname = useRouterState().location.pathname;
  // const chatRoomType: "group" | "private" =
  //   chatRoom.people.length === 2 ? "private" : "group";
  const chatMateId = chatRoom.people.filter((i) => i !== currentUserInfo?.dB.id)[0];
  const chatMateData = useQuery(userInfoQueryOptions(chatMateId, chatMateId));
  if (chatMateData.isLoading) return;
  return (
    <MessageBtn
      className={`flex-row bg-muted p-2 justify-start flex-1 rounded-none sm:rounded-md border-b sm:border-b-0`}
      variant={"secondary"}
      targetedUserId={chatMateId}
    >
      <UserAvatar
        linkable={false}
        url={chatMateData.data?.image}
        username={chatMateData.data?.username}
      />
      <p className={`${pathname === "/m" ? "" : "hidden md:block"}`}>
        {chatMateData.data?.username}
      </p>
    </MessageBtn>
  );
}
