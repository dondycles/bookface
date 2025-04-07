import { Button } from "@/lib/components/ui/button";
import UserAvatar from "@/lib/components/user-avatar";
import UserFriendshipOptionsBtns from "@/lib/components/user-friendship-options-btns";
import { currentUserInfoQueryOptions, userInfoQueryOptions } from "@/lib/queries/user";
import { CurrentUserInfo } from "@/lib/server/fn/user";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
export const Route = createFileRoute("/$username")({
  component: RouteComponent,
  beforeLoad: async ({ params, context }) => {
    const isMyProfile = params.username === context.currentUserInfo?.dB.username;
    return { isMyProfile };
  },
  loader: ({ params: { username }, context: { isMyProfile, currentUserInfo } }) => {
    return {
      username,
      isMyProfile,
      currentUserInfo,
    };
  },
});

function RouteComponent() {
  const { username, isMyProfile, currentUserInfo } = Route.useLoaderData();

  if (!isMyProfile)
    return <OtherUserInfo currentUserInfo={currentUserInfo} username={username} />;

  return <MyProfile />;
}
function MyProfile() {
  const { currentUserInfo } = Route.useLoaderData();
  const { data: myProfile } = useQuery({
    initialData: currentUserInfo ?? null,
    ...currentUserInfoQueryOptions(),
  });
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
            <p className="text-center italic ">
              {myProfile?.dB.bio?.length === 0 ? "No bio yet." : myProfile?.dB.bio}
            </p>
            <Link to={"/settings"} className="flex-1">
              <Button variant={"outline"} className="h-fit w-full">
                Edit Profile <ExternalLink />
              </Button>
            </Link>
            <Navigation />
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
function OtherUserInfo({
  username,
  currentUserInfo,
}: {
  username: string;
  currentUserInfo: CurrentUserInfo;
}) {
  const profile = useQuery(userInfoQueryOptions(username));

  return (
    <div className="py-24 sm:max-w-[512px] mx-auto">
      {!profile.data ? (
        <p className="text-center text-muted-foreground">User not found!</p>
      ) : (
        <div className="flex flex-col gap-4 ">
          <div className="text-muted-foreground">
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
              <p className="text-center italic ">
                {profile.data.bio?.length === 0 ? "No bio yet." : profile.data.bio}
              </p>
              <UserFriendshipOptionsBtns
                currentUserInfo={currentUserInfo}
                targetedUserId={profile.data.id}
              />
              <Navigation />
            </div>
          </div>
          <Outlet />
        </div>
      )}
    </div>
  );
}

function Navigation() {
  const { username } = Route.useLoaderData();
  const router = useRouterState();

  return (
    <div className="flex gap-[1px] rounded-md overflow-hidden ">
      <Button
        asChild
        variant={router.location.pathname.match("/posts") ? "default" : "secondary"}
        className="text-xs flex-1 rounded-r-none"
      >
        <Link
          to="/$username/posts"
          params={{ username }}
          search={{ flow: "desc", postsOrderBy: "recent" }}
        >
          Posts
        </Link>
      </Button>
      <Button
        asChild
        variant={router.location.pathname.match("/friends") ? "default" : "secondary"}
        className="text-xs flex-1 rounded-l-none"
      >
        <Link to="/$username/friends" params={{ username }}>
          Friends
        </Link>
      </Button>
    </div>
  );
}
