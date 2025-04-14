import NotificationItemBar from "@/lib/components/notification-item-bar";
import { Button } from "@/lib/components/ui/button";
import useAutoLoadNextPage from "@/lib/hooks/useAutoLoadNextPage";
import { currentUserNotificationsQueryOptions } from "@/lib/queries/notifications";
import { readNotification } from "@/lib/server/fn/notification";
import { errorHandlerWithToast, navigateToNotif } from "@/lib/utils";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/notifications")({
  component: RouteComponent,
});

function RouteComponent() {
  const { currentUserInfo } = Route.useRouteContext();
  const router = useRouter();
  const notifications = useInfiniteQuery(
    currentUserNotificationsQueryOptions(currentUserInfo),
  );
  const _notifications = notifications.data?.pages.flatMap((page) => page);
  const handleReadNotifications = useMutation({
    mutationFn: async (ids: [string]) => await readNotification({ data: { ids } }),
    onSuccess: () => {
      notifications.refetch();
    },
    onError: (e: Error) => {
      errorHandlerWithToast(e);
    },
  });
  const isPending = notifications.isPending || handleReadNotifications.isPending;

  const { ref, loaderRef } = useAutoLoadNextPage({
    fetchNextPage: () => notifications.fetchNextPage(),
  });
  return (
    <div className="pt-20 sm:max-w-[512px] mx-auto h-full">
      <p className="text-2xl font-bold px-2 py-4">Notifications</p>
      <div className="space-y-2">
        {_notifications?.map((n, i) => {
          if (i === _notifications.length - 1)
            return (
              <NotificationItemBar
                ref={ref}
                className="flex gap-2 bg-accent/10 sm:rounded-md"
                n={n}
                key={n.id}
                isPending={isPending}
                onClick={() => {
                  handleReadNotifications.mutate([n.id]);
                  navigateToNotif(n, router);
                }}
              />
            );
          return (
            <NotificationItemBar
              className="flex gap-2 bg-accent/10 sm:rounded-md"
              n={n}
              key={n.id}
              isPending={isPending}
              onClick={() => {
                handleReadNotifications.mutate([n.id]);
                navigateToNotif(n, router);
              }}
            />
          );
        })}
        <Button
          className="text-xs text-muted-foreground font-light"
          hidden={!notifications.hasNextPage}
          ref={loaderRef}
          variant={"ghost"}
          onClick={() => {
            notifications.fetchNextPage();
          }}
        >
          {notifications.isFetchingNextPage ? "Loading..." : "Fetch more posts"}
        </Button>
      </div>
    </div>
  );
}
