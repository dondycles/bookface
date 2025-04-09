import { Button } from "@/lib/components/ui/button";
import { Skeleton } from "@/lib/components/ui/skeleton";
import UserAvatar from "@/lib/components/user/user-avatar";
import UserBar from "@/lib/components/user/user-bar";
import UserLink from "@/lib/components/user/user-link";
import {
  useAcceptFriendshipRequestMutation,
  useRemoveFriendshipMutation,
} from "@/lib/mutations/friendship";
import {
  currentUserFriendshipsQueryOptions,
  thisUserAcceptedfriendshipsQueryOptions,
} from "@/lib/queries/friendship";
import { getModifiedFriendships } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ExternalLink, X } from "lucide-react";

export const Route = createFileRoute("/$username/friends")({
  component: RouteComponent,
  loader: ({ params: { username }, context: { isMyProfile, currentUserInfo } }) => {
    return {
      username,
      isMyProfile,
      currentUserInfo,
    };
  },
});

function RouteComponent() {
  const { isMyProfile } = Route.useLoaderData();

  if (!isMyProfile) return <OtherUserFriends />;
  return <MyFriends />;
}

function MyFriends() {
  const { currentUserInfo } = Route.useRouteContext();
  const friendships = useQuery({ ...currentUserFriendshipsQueryOptions() });
  const _friendships = getModifiedFriendships(
    friendships.data ?? [],
    currentUserInfo?.dB.username ?? "",
  );
  if (friendships.isFetching)
    return (
      <div className="flex flex-col gap-4 flex-1">
        <Skeleton className="w-full py-4 px-2 sm:px-4 sm:rounded-md rounded-none flex gap-2">
          <Skeleton className="size-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="size-10 mb-0 mt-auto" />
        </Skeleton>
        <Skeleton className="w-full py-4 px-2 sm:px-4 sm:rounded-md rounded-none flex gap-2">
          <Skeleton className="size-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="size-10 mb-0 mt-auto" />
        </Skeleton>
        <Skeleton className="w-full py-4 px-2 sm:px-4 sm:rounded-md rounded-none flex gap-2">
          <Skeleton className="size-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="size-10 mb-0 mt-auto" />
        </Skeleton>
      </div>
    );
  return (
    <div className="flex flex-col gap-4 flex-1">
      {_friendships.map((f) => {
        return <FriendshipBar friendship={f} key={`${f.id}-friend`} />;
      })}
    </div>
  );
}

function OtherUserFriends() {
  const { username } = Route.useLoaderData();
  const friendships = useQuery({
    ...thisUserAcceptedfriendshipsQueryOptions(username),
  });
  const _friendships = getModifiedFriendships(friendships.data ?? [], username);
  return (
    <>
      {_friendships.map((f) => {
        return <UserBar u={f.info} key={`${f.info.id}-friend`} />;
      })}
    </>
  );
}

function FriendshipBar({
  friendship,
}: {
  friendship: ReturnType<typeof getModifiedFriendships>[0];
}) {
  const { queryClient } = Route.useRouteContext();
  const handleRemoveFriendship = useRemoveFriendshipMutation({
    friendshipId: friendship.id,
    targetedUserId: friendship.info.id,
    refetch: () => {
      queryClient.invalidateQueries({
        queryKey: ["currentUserFriendships"],
      });
    },
  });

  const handleAcceptFriendship = useAcceptFriendshipRequestMutation({
    friendshipId: friendship.id,
    targetedUserId: friendship.info.id,
    refetch: () => {
      queryClient.invalidateQueries({
        queryKey: ["currentUserFriendships"],
      });
    },
  });

  // useEffect(() => {
  //   if (!currentUserInfo) return;
  //   pusher.subscribe(currentUserInfo.dB.id);
  //   pusher.bind("notification", () => {
  //     queryClient.invalidateQueries({
  //       queryKey: ["currentUserFriendships"],
  //     });
  //   });
  //   return () => {
  //     pusher.unsubscribe(currentUserInfo.dB.id);
  //   };
  // }, [currentUserInfo, queryClient]);

  return (
    <div
      key={friendship.id}
      className="sm:rounded-md bg-muted py-4 px-2 sm:px-4 flex gap-2 justify-between"
    >
      <div className="flex gap-2 items-center">
        <UserAvatar
          className="size-14"
          username={friendship.info.username}
          url={friendship.info.image}
        />
        <div>
          <UserLink
            className="font-semibold text-lg"
            text={`@${friendship.info.name}`}
            username={friendship.info.username ?? ""}
          />
          <UserLink
            className="text-muted-foreground text-sm"
            text={`@${friendship.info.username}`}
            username={friendship.info.username ?? ""}
          />

          <p className="text-muted-foreground text-sm">
            Joined: {friendship.createdAt.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="flex flex-col justify-between items-end">
        <Link
          to="/$username/posts"
          search={{ postsOrderBy: "recent", flow: "desc" }}
          params={{ username: friendship.info.username ?? "" }}
        >
          <ExternalLink className="text-muted-foreground size-5" />
        </Link>
        <div className="flex gap-[1px] flex-row">
          {friendship.status === "pending" ? (
            <>
              <Button
                onClick={() => {
                  handleAcceptFriendship.mutate();
                }}
                className="rounded-r-none"
                variant={"secondary"}
              >
                <Check />
              </Button>
              <Button
                onClick={() => {
                  handleRemoveFriendship.mutate();
                }}
                className="rounded-l-none"
                variant={"destructive"}
              >
                <X />
              </Button>
            </>
          ) : (
            <Button
              onClick={() => {
                handleRemoveFriendship.mutate();
              }}
              variant={"destructive"}
            >
              <X />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
