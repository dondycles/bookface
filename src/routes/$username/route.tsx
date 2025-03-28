import UserAvatar from "@/lib/components/avatar";
import EditBioDialog from "@/lib/components/edit-bio-dialog";
import PostCard from "@/lib/components/post-card";
import { Button } from "@/lib/components/ui/button";
import { currentUserQueryOptions, userQueryOptions } from "@/lib/queries/user";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$username")({
  component: RouteComponent,
  beforeLoad: async ({ params, context }) => {
    const isMyProfile = params.username === context.currentUser?.dB.username;
    return { isMyProfile };
  },
  loader: ({ params, context }) => {
    return {
      username: params.username,
      isMyProfile: context.isMyProfile,
      currentUser: context.currentUser,
    };
  },
});

function RouteComponent() {
  const { username, isMyProfile, currentUser } = Route.useLoaderData();
  const { data: myProfile } = useSuspenseQuery({
    initialData: currentUser,
    ...currentUserQueryOptions(),
  });
  if (!isMyProfile) return <OtherUserProfile username={username} />;
  return (
    <div className="py-24 sm:max-w-[512px] mx-auto">
      <div className="flex flex-col gap-4 ">
        <div className="text-muted-foreground">
          <div className="flex flex-col gap-4 bg-muted sm:rounded-md p-4">
            <div className="flex gap-4">
              <UserAvatar
                className="size-24"
                url={myProfile?.dB.image}
                alt={myProfile?.dB.username ?? myProfile?.dB.name ?? "User PFP"}
              />
              <div className="flex flex-col ">
                <p className="text-2xl font-bold text-foreground">{myProfile?.dB.name}</p>
                <div className="flex flex-col justify-between flex-1 text-sm">
                  <p>@{myProfile?.dB.username}</p>
                  <p className="font-mono">
                    Joined {myProfile?.dB.createdAt.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            {isMyProfile ? (
              <EditBioDialog>
                <Button variant={"outline"} className="h-fit flex-1 whitespace-pre-wrap">
                  <p className="text-center italic ">
                    {myProfile?.dB.bio ?? "Set your bio"}
                  </p>
                </Button>
              </EditBioDialog>
            ) : (
              <p className="text-center italic ">{myProfile?.dB.bio ?? "No bio yet."}</p>
            )}
            <div>
              <span>{myProfile?.dB.posts.length} post(s)</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 h-full w-full">
          {myProfile?.dB.posts?.map((post) => {
            return <PostCard postId={post.id} key={post.id} deepView={false} />;
          })}
        </div>
      </div>
    </div>
  );
}
function OtherUserProfile({ username }: { username: string }) {
  const profile = useSuspenseQuery(userQueryOptions(username));

  return (
    <div className="py-24 sm:max-w-[512px] mx-auto">
      {!profile.data ? (
        <>User not found!</>
      ) : (
        <div className="sm:px-4 flex flex-col gap-4 ">
          <div className="sm:px-2 text-muted-foreground">
            <div className="flex flex-col gap-4 bg-muted sm:rounded-md p-4">
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
              <p className="text-center italic ">{profile.data.bio ?? "No bio yet."}</p>
              <div>
                <span>{profile.data.posts.length} post(s)</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:gap-2 h-full w-full sm:px-2 ">
            {profile.data.posts?.map((post) => {
              return <PostCard postId={post.id} key={post.id} deepView={false} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
