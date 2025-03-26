import UserAvatar from "@/lib/components/avatar";
import PostCard from "@/lib/components/post-card";
import { userQueryOptions } from "@/lib/queries/user";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$username")({
  component: RouteComponent,
  loader: ({ params, context }) => {
    return {
      username: params.username,
      currentUser: context.currentUser,
    };
  },
});

function RouteComponent() {
  const { currentUser, username } = Route.useLoaderData();
  const { queryClient } = Route.useRouteContext();
  const profile = useSuspenseQuery(userQueryOptions(username));

  return (
    <div className="py-20 sm:max-w-[512px] mx-auto">
      {!profile.data ? (
        <>User not found!</>
      ) : (
        <div className="px-2 sm:px-4 flex flex-col gap-4">
          <div className="flex gap-4">
            <UserAvatar
              className="size-24"
              url={profile.data.image}
              alt={profile.data.username ?? profile.data.name}
            />
            <div className="flex flex-col ">
              <p className="text-2xl font-bold">{profile.data.name}</p>
              <div className="text-muted-foreground flex flex-col justify-between flex-1 text-sm">
                <p>@{profile.data.username}</p>
                <p className="font-mono">
                  Joined {profile.data.createdAt.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:gap-2 h-full w-full sm:px-2 ">
            {profile.data.posts?.map((post) => {
              return (
                <PostCard
                  post={post}
                  currentUser={currentUser}
                  queryClient={queryClient}
                  key={post.id}
                  deepView={false}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
