import ChatRoomEntryBar from "@/lib/components/message-entry-bar";
import { Skeleton } from "@/lib/components/ui/skeleton";
import { currentUserChatRoomIdsQueryOptions } from "@/lib/queries/messages";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, useMatchRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/m")({
  component: RouteComponent,
});

function RouteComponent() {
  const chatRoomIds = useQuery(currentUserChatRoomIdsQueryOptions());
  const matchRoute = useMatchRoute();
  const { currentUserInfo } = Route.useRouteContext();
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
            <Skeleton className="w-full h-10" />
          </>
        ) : (
          chatRoomIds.data?.map((c) => {
            return (
              <ChatRoomEntryBar
                className="rounded-none sm:rounded-md border-b sm:border-b-0"
                currentUserInfo={currentUserInfo}
                key={c.id}
                chatRoom={c}
              />
            );
          })
        )}
      </div>

      <Outlet />
    </div>
  );
}
