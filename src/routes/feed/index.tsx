import AddPostBar from "@/lib/components/post/add-post-bar";
import PostCard from "@/lib/components/post/post-card";
import PostsOptionsBar from "@/lib/components/post/posts-options-bar";
import { Button } from "@/lib/components/ui/button";
import useAutoLoadNextPage from "@/lib/hooks/useAutoLoadNextPage";
import { postsQueryOptions } from "@/lib/queries/posts";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

export const searchSchema = z.object({
  sortBy: z.enum(["likes", "recent"]),
});

export type SortBy = z.infer<typeof searchSchema.shape.sortBy>;

export const Route = createFileRoute("/feed/")({
  component: FeedIndex,
  validateSearch: (search) => searchSchema.parse(search),
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
    return { sortBy: context.search.sortBy, currentUserInfo: context.currentUserInfo };
  },
});

function FeedIndex() {
  const { currentUserInfo, sortBy } = Route.useLoaderData();
  const posts = useInfiniteQuery(postsQueryOptions(currentUserInfo, sortBy));
  const _posts = posts.data?.pages.flatMap((page) => page);

  const { ref, loaderRef } = useAutoLoadNextPage({
    fetchNextPage: () => {
      posts.fetchNextPage();
    },
  });

  return (
    <div className="flex flex-col gap-4 py-24 sm:max-w-[512px] mx-auto">
      <AddPostBar currentUserInfo={currentUserInfo} />
      <PostsOptionsBar
        sortByState={sortBy}
        mostLikes={{ to: "/feed", search: { sortBy: "likes" } }}
        mostRecent={{ to: "/feed", search: { sortBy: "recent" } }}
        isMyProfile={false}
      />
      <div className="flex flex-col gap-4 h-full w-full ">
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
            <div ref={ref} key={post.id} className="flex-1">
              <PostCard
                currentUserInfo={currentUserInfo}
                postId={post.id}
                key={post.id}
                deepView={false}
              />
            </div>
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
  );
}
