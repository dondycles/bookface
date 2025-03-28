import UserAvatar from "@/lib/components/avatar";
import EditBioDialog from "@/lib/components/edit-bio-dialog";
import PostCard from "@/lib/components/post-card";
import { Button } from "@/lib/components/ui/button";
import { userQueryOptions } from "@/lib/queries/user";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$username")({
  component: RouteComponent,
  loader: ({ params }) => {
    return {
      username: params.username,
    };
  },
});

function RouteComponent() {
  const { username } = Route.useLoaderData();
  const { queryClient, currentUser } = Route.useRouteContext();
  const profile = useSuspenseQuery(userQueryOptions(username));
  const isMyProfile = currentUser?.dB?.id === profile.data?.id;

  return (
    <div className="py-24 sm:max-w-[512px] mx-auto">
      {!profile.data ? (
        <>User not found!</>
      ) : (
        <div className="sm:px-4 flex flex-col gap-4 ">
          <div className="sm:px-2 text-muted-foreground">
            <div className="flex flex-col gap-4 bg-muted/25 sm:rounded-md p-4">
              <div className="flex gap-4">
                <UserAvatar
                  className="size-24"
                  url={profile.data.image}
                  alt={profile.data.username ?? profile.data.name}
                />
                <div className="flex flex-col ">
                  <p className="text-2xl font-bold text-foreground">
                    {profile.data.name}
                  </p>
                  <div className="flex flex-col justify-between flex-1 text-sm">
                    <p>@{profile.data.username}</p>
                    <p className="font-mono">
                      Joined {profile.data.createdAt.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              {isMyProfile ? (
                <EditBioDialog>
                  <Button
                    variant={"outline"}
                    className="h-fit flex-1 whitespace-pre-wrap"
                  >
                    <p className="text-center italic ">
                      {profile.data.bio ?? "Set your bio"}
                    </p>
                  </Button>
                </EditBioDialog>
              ) : (
                <p className="text-center italic ">{profile.data.bio ?? "No bio yet."}</p>
              )}

              <div>
                <span>{profile.data.posts.length} post(s)</span>
                <span> | </span>
                <span>2 friend(s)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:gap-2 h-full w-full sm:px-2 ">
            {profile.data.posts?.map((post) => {
              return (
                <PostCard
                  postId={post.id}
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
