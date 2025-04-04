import AddPostBar from "@/lib/components/post/add-post-bar";
import PostsMapper from "@/lib/components/post/posts-mapper";
import PostsOptionsBar from "@/lib/components/post/posts-options-bar";
import { PostsOrderer } from "@/lib/components/post/posts-orderer";
import SelectedPostOptionsFloatingBar from "@/lib/components/post/selected-posts-options-floating-bar";
import { Button } from "@/lib/components/ui/button";
import UserAvatar from "@/lib/components/user-avatar";
import { currentUserPostsQueryOptions, userPostsQueryOptions } from "@/lib/queries/posts";
import { currentUserInfoQueryOptions, userInfoQueryOptions } from "@/lib/queries/user";
import { searchFeedSchema } from "@/lib/search-schema";
import { CurrentUserInfo } from "@/lib/server/fn/user";
import { useInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import {
  AnyRouter,
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

export const Route = createFileRoute("/$username")({
  component: RouteComponent,
  validateSearch: (search) => searchFeedSchema.parse(search),

  beforeLoad: async ({ params, context, search }) => {
    const isMyProfile = params.username === context.currentUserInfo?.dB.username;
    if (search.postsOrderBy !== "likes" && search.postsOrderBy !== "recent") {
      throw redirect({
        to: "/feed",
        search: {
          postsOrderBy: "recent",
          flow: search.flow,
        },
      });
    }
    if (search.flow !== "asc" && search.flow !== "desc") {
      throw redirect({
        to: "/feed",
        search: {
          postsOrderBy: search.postsOrderBy,
          flow: "desc",
        },
      });
    }
    return { isMyProfile, search };
  },
  loader: ({
    params: { username },
    context: {
      isMyProfile,
      currentUserInfo,
      search: { flow, postsOrderBy },
    },
  }) => {
    return {
      username,
      isMyProfile,
      currentUserInfo,
      postsOrderBy,
      flow,
    };
  },
});

function RouteComponent() {
  const router = useRouter();
  const { username, isMyProfile, currentUserInfo, postsOrderBy, flow } =
    Route.useLoaderData();
  const { data: myProfile } = useSuspenseQuery({
    initialData: currentUserInfo,
    ...currentUserInfoQueryOptions(),
  });
  const myPosts = useInfiniteQuery({
    ...currentUserPostsQueryOptions(postsOrderBy, flow),
  });
  const _myPosts = myPosts.data?.pages.flatMap((page) => page);

  if (!isMyProfile)
    return (
      <OtherUserProfile
        currentUserInfo={currentUserInfo}
        username={username}
        router={router}
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

        <PostsOptionsBar router={router} isMyProfile={isMyProfile}>
          <PostsOrderer
            router={router}
            mostLikes={(flow) => ({
              to: "/$username",
              search: { postsOrderBy: "likes", flow },
            })}
            mostRecent={(flow) => ({
              to: "/$username",
              search: { postsOrderBy: "recent", flow },
            })}
            flow={flow}
            postsOrderBy={postsOrderBy}
          />
        </PostsOptionsBar>
        <PostsMapper
          _posts={_myPosts}
          currentUserInfo={currentUserInfo}
          fetchNextPage={myPosts.fetchNextPage}
          hasNextPage={myPosts.hasNextPage}
          isFetchingNextPage={myPosts.isFetchingNextPage}
        />
        <SelectedPostOptionsFloatingBar />
      </div>
    </div>
  );
}
function OtherUserProfile({
  username,
  currentUserInfo,
  router,
}: {
  username: string;
  currentUserInfo: CurrentUserInfo;
  router: AnyRouter;
}) {
  const { postsOrderBy, flow } = Route.useLoaderData();
  const profile = useSuspenseQuery(userInfoQueryOptions(username));
  const posts = useInfiniteQuery({
    ...userPostsQueryOptions(username, postsOrderBy, flow),
  });
  const _posts = posts.data?.pages.flatMap((page) => page);

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

          <PostsOptionsBar router={router} isMyProfile={false}>
            <PostsOrderer
              router={router}
              mostLikes={(flow) => ({
                to: "/$username",
                search: { postsOrderBy: "likes", flow },
              })}
              mostRecent={(flow) => ({
                to: "/$username",
                search: { postsOrderBy: "recent", flow },
              })}
              flow={flow}
              postsOrderBy={postsOrderBy}
            />
          </PostsOptionsBar>
          <PostsMapper
            _posts={_posts}
            fetchNextPage={() => posts.fetchNextPage()}
            hasNextPage={posts.hasNextPage}
            isFetchingNextPage={posts.isFetchingNextPage}
            currentUserInfo={currentUserInfo}
          />
        </div>
      )}
    </div>
  );
}
