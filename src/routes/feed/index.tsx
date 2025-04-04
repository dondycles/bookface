import AddPostBar from "@/lib/components/post/add-post-bar";
import PostsMapper from "@/lib/components/post/posts-mapper";
import PostsOptionsBar from "@/lib/components/post/posts-options-bar";
import { postsQueryOptions } from "@/lib/queries/posts";
import { searchPostsSortBySchema } from "@/lib/search-schema";

import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/feed/")({
  component: FeedIndex,
  validateSearch: (search) => searchPostsSortBySchema.parse(search),
  beforeLoad: ({ search }) => {
    if (search.postsSortBy !== "likes" && search.postsSortBy !== "recent") {
      throw redirect({
        to: "/feed",
        search: {
          postsSortBy: "recent",
        },
      });
    }
    return { search };
  },
  loader: async ({ context }) => {
    context.queryClient.ensureInfiniteQueryData(
      postsQueryOptions(context.currentUserInfo, context.search.postsSortBy),
    );
    return {
      postsSortBy: context.search.postsSortBy,
      currentUserInfo: context.currentUserInfo,
    };
  },
});

function FeedIndex() {
  const { currentUserInfo, postsSortBy } = Route.useLoaderData();
  const posts = useInfiniteQuery(postsQueryOptions(currentUserInfo, postsSortBy));
  const _posts = posts.data?.pages.flatMap((page) => page);

  return (
    <div className="flex flex-col gap-4 py-24 sm:max-w-[512px] mx-auto">
      <AddPostBar currentUserInfo={currentUserInfo} />
      <PostsOptionsBar
        postsSortByState={postsSortBy}
        mostLikes={{ to: "/feed", search: { postsSortBy: "likes" } }}
        mostRecent={{ to: "/feed", search: { postsSortBy: "recent" } }}
        isMyProfile={false}
      />
      <PostsMapper
        _posts={_posts}
        fetchNextPage={() => posts.fetchNextPage()}
        hasNextPage={posts.hasNextPage}
        isFetchingNextPage={posts.isFetchingNextPage}
        currentUserInfo={currentUserInfo}
      />
    </div>
  );
}
