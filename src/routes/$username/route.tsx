import AddPostBar from "@/lib/components/add-post-bar";
import UserAvatar from "@/lib/components/avatar";
import PostCard from "@/lib/components/post-card";
import PostsSorter from "@/lib/components/posts-sorter";
import { Button } from "@/lib/components/ui/button";
import { currentUserPostsQueryOptions } from "@/lib/queries/posts";
import { currentUserInfoQueryOptions, userQueryOptions } from "@/lib/queries/user";
import { CurrentUserInfo } from "@/lib/server/fn/user";
import { useInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { searchSchema } from "../feed";

export const Route = createFileRoute("/$username")({
  component: RouteComponent,
  validateSearch: (search) => searchSchema.parse(search),

  beforeLoad: async ({ params, context, search }) => {
    const isMyProfile = params.username === context.currentUserInfo?.dB.username;
    if (search.sortBy !== "likes" && search.sortBy !== "recent") {
      throw redirect({
        to: "/feed",
        search: {
          sortBy: "recent",
        },
      });
    }
    return { isMyProfile, search };
  },
  loader: ({ params, context }) => {
    return {
      username: params.username,
      isMyProfile: context.isMyProfile,
      currentUserInfo: context.currentUserInfo,
      sortBy: context.search.sortBy,
    };
  },
});

function RouteComponent() {
  const { username, isMyProfile, currentUserInfo, sortBy } = Route.useLoaderData();
  const { data: myProfile } = useSuspenseQuery({
    initialData: currentUserInfo,
    ...currentUserInfoQueryOptions(),
  });
  const { data: myPosts } = useInfiniteQuery({ ...currentUserPostsQueryOptions(sortBy) });
  const _myPosts = myPosts?.pages.flatMap((page) => page);

  if (!isMyProfile)
    return <OtherUserProfile currentUserInfo={currentUserInfo} username={username} />;
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
            <p className="text-center italic ">{myProfile?.dB.bio ?? "No bio yet."}</p>
            {isMyProfile ? (
              <Link to={"/settings"} className="flex-1">
                <Button variant={"outline"} className="h-fit w-full">
                  Edit Profile <ExternalLink />
                </Button>
              </Link>
            ) : (
              <p className="text-center italic ">{myProfile?.dB.bio ?? "No bio yet."}</p>
            )}
            <div>
              <span>{_myPosts?.length} post(s)</span>
            </div>
          </div>
        </div>
        <AddPostBar currentUserInfo={currentUserInfo} />
        <PostsSorter
          mostLikes={{ to: "/$username", search: { sortBy: "likes" } }}
          mostRecent={{ to: "/$username", search: { sortBy: "recent" } }}
          sortByState={sortBy}
        />
        <div className="flex flex-col gap-4 h-full w-full">
          {_myPosts?.map((post) => {
            return (
              <PostCard
                currentUserInfo={currentUserInfo}
                postId={post.id}
                key={post.id}
                deepView={false}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
function OtherUserProfile({
  username,
  currentUserInfo,
}: {
  username: string;
  currentUserInfo: CurrentUserInfo;
}) {
  const { sortBy } = Route.useLoaderData();
  const profile = useSuspenseQuery(userQueryOptions(username, sortBy));

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
          <PostsSorter
            mostLikes={{ to: "/$username", search: { sortBy: "likes" } }}
            mostRecent={{ to: "/$username", search: { sortBy: "recent" } }}
            sortByState={sortBy}
          />
          <div className="flex flex-col sm:gap-2 h-full w-full sm:px-2 ">
            {profile.data.posts?.map((post) => {
              return (
                <PostCard
                  currentUserInfo={currentUserInfo}
                  postId={post.id}
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
