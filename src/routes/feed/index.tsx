import AddPostBar from "@/lib/components/post/add-post-bar";
import PostsMapper from "@/lib/components/post/posts-mapper";
import PostsOptionsBar from "@/lib/components/post/posts-options-bar";
import { searchSortBySchema } from "@/lib/global-schema";
import { postsQueryOptions } from "@/lib/queries/posts";

import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/feed/")({
  component: FeedIndex,
  validateSearch: (search) => searchSortBySchema.parse(search),
  beforeLoad: ({ search }) => {
    if (search.sortBy !== "likes" && search.sortBy !== "recent") {
      throw redirect({
        to: "/feed",
        search: {
          sortBy: "recent",
        },
      });
    }
    return { search };
  },
  loader: async ({ context }) => {
    context.queryClient.ensureInfiniteQueryData(
      postsQueryOptions(context.currentUserInfo, context.search.sortBy),
    );
    return { sortBy: context.search.sortBy, currentUserInfo: context.currentUserInfo };
  },
});

function FeedIndex() {
  const { currentUserInfo, sortBy } = Route.useLoaderData();
  const posts = useInfiniteQuery(postsQueryOptions(currentUserInfo, sortBy));
  const _posts = posts.data?.pages.flatMap((page) => page);

  return (
    <div className="flex flex-col gap-4 py-24 sm:max-w-[512px] mx-auto">
      <AddPostBar currentUserInfo={currentUserInfo} />
      <PostsOptionsBar
        sortByState={sortBy}
        mostLikes={{ to: "/feed", search: { sortBy: "likes" } }}
        mostRecent={{ to: "/feed", search: { sortBy: "recent" } }}
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
