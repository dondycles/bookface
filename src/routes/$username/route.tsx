import AddPostBar from "@/lib/components/post/add-post-bar";
import PostCard from "@/lib/components/post/post-card";
import PostsOptionsBar from "@/lib/components/post/posts-options-bar";
import SelectedPostOptionsFloatingBar from "@/lib/components/post/selected-posts-options-floating-bar";
import { Button } from "@/lib/components/ui/button";
import UserAvatar from "@/lib/components/user-avatar";
import useAutoLoadNextPage from "@/lib/hooks/useAutoLoadNextPage";
import { currentUserPostsQueryOptions, userPostsQueryOptions } from "@/lib/queries/posts";
import { currentUserInfoQueryOptions, userInfoQueryOptions } from "@/lib/queries/user";
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
  const myPosts = useInfiniteQuery({ ...currentUserPostsQueryOptions(sortBy) });
  const _myPosts = myPosts.data?.pages.flatMap((page) => page);

  const { ref, loaderRef } = useAutoLoadNextPage({
    fetchNextPage: () => {
      myPosts.fetchNextPage();
    },
  });

  if (!isMyProfile)
    return (
      <OtherUserProfile
        isMyProfile={isMyProfile}
        currentUserInfo={currentUserInfo}
        username={username}
      />
    );
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
        <PostsOptionsBar
          mostLikes={{ to: "/$username", search: { sortBy: "likes" } }}
          mostRecent={{ to: "/$username", search: { sortBy: "recent" } }}
          sortByState={sortBy}
          isMyProfile={isMyProfile}
        />
        <div className="flex flex-col gap-4 h-full w-full">
          {_myPosts?.map((post, i) => {
            if (i === _myPosts.length - 1)
              return (
                <div ref={ref} key={post.id} className="flex-1">
                  <PostCard
                    currentUserInfo={currentUserInfo}
                    postId={post.id}
                    key={post.id}
                    deepView={false}
                  />
                </div>
              );
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
        <SelectedPostOptionsFloatingBar />
        <Button
          className="text-xs text-muted-foreground font-light"
          hidden={!myPosts.hasNextPage}
          ref={loaderRef}
          variant={"ghost"}
          onClick={() => {
            myPosts.fetchNextPage();
          }}
        >
          {myPosts.isFetchingNextPage ? "Loading..." : "Fetch more posts"}
        </Button>
      </div>
    </div>
  );
}
function OtherUserProfile({
  username,
  currentUserInfo,
  isMyProfile,
}: {
  username: string;
  currentUserInfo: CurrentUserInfo;
  isMyProfile: boolean;
}) {
  const { sortBy } = Route.useLoaderData();
  const profile = useSuspenseQuery(userInfoQueryOptions(username));
  const posts = useInfiniteQuery({ ...userPostsQueryOptions(username, sortBy) });
  const _posts = posts.data?.pages.flatMap((page) => page);

  const { ref, loaderRef } = useAutoLoadNextPage({
    fetchNextPage: () => {
      posts.fetchNextPage();
    },
  });

  return (
    <div className="py-24 sm:max-w-[512px] mx-auto">
      {!profile.data ? (
        <>User not found!</>
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
              <p className="text-center italic ">{profile.data.bio ?? "No bio yet."}</p>
              <div>
                <span>{_posts?.length} post(s)</span>
              </div>
            </div>
          </div>

          <PostsOptionsBar
            mostLikes={{ to: "/$username", search: { sortBy: "likes" } }}
            mostRecent={{ to: "/$username", search: { sortBy: "recent" } }}
            sortByState={sortBy}
            isMyProfile={isMyProfile}
          />

          <div className="flex flex-col gap-4 h-full w-full">
            {_posts?.map((post, i) => {
              if (i === _posts.length - 1)
                return (
                  <div ref={ref} key={post.id} className="flex-1">
                    <PostCard
                      currentUserInfo={currentUserInfo}
                      postId={post.id}
                      key={post.id}
                      deepView={false}
                    />
                  </div>
                );
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
          <Button
            className="text-xs text-muted-foreground font-light"
            hidden={!posts.hasNextPage}
            ref={loaderRef}
            variant={"ghost"}
            onClick={() => {
              posts.fetchNextPage();
            }}
          >
            {posts.isFetchingNextPage ? "Loading..." : "Fetch more posts"}
          </Button>
        </div>
      )}
    </div>
  );
}
