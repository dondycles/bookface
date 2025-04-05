import AddPostBar from "@/lib/components/post/add-post-bar";
import PostsMapper from "@/lib/components/post/posts-mapper";
import PostsOptionsBar from "@/lib/components/post/posts-options-bar";
import { PostsOrderer } from "@/lib/components/post/posts-orderer";
import SelectedPostOptionsFloatingBar from "@/lib/components/post/selected-posts-options-floating-bar";
import { currentUserPostsQueryOptions, userPostsQueryOptions } from "@/lib/queries/posts";
import { searchFeedSchema } from "@/lib/search-schema";
import { CurrentUserInfo } from "@/lib/server/fn/user";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AnyRouter, createFileRoute, redirect, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/$username/posts")({
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
    <>
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
    </>
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
  const posts = useInfiniteQuery({
    ...userPostsQueryOptions(username, postsOrderBy, flow),
  });
  const _posts = posts.data?.pages.flatMap((page) => page);
  return (
    <>
      <PostsOptionsBar router={router} isMyProfile={false}>
        <PostsOrderer
          router={router}
          mostLikes={(flow) => ({
            to: "/$username/posts",
            search: { postsOrderBy: "likes", flow },
          })}
          mostRecent={(flow) => ({
            to: "/$username/posts",
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
    </>
  );
}
