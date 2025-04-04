import AddPostBar from "@/lib/components/post/add-post-bar";
import PostsMapper from "@/lib/components/post/posts-mapper";
import PostsOptionsBar from "@/lib/components/post/posts-options-bar";
import { PostsOrderer } from "@/lib/components/post/posts-orderer";
import { postsQueryOptions } from "@/lib/queries/posts";
import { searchFeedSchema } from "@/lib/search-schema";

import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/feed/")({
  component: FeedIndex,
  validateSearch: (search) => searchFeedSchema.parse(search),
  beforeLoad: ({ search }) => {
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
    return { search };
  },
  loader: async ({
    context: {
      queryClient,
      currentUserInfo,
      search: { flow, postsOrderBy },
    },
  }) => {
    queryClient.ensureInfiniteQueryData(
      postsQueryOptions(currentUserInfo, postsOrderBy, flow),
    );
    return {
      postsOrderBy,
      currentUserInfo,
      flow,
    };
  },
});

function FeedIndex() {
  const { currentUserInfo, postsOrderBy, flow } = Route.useLoaderData();
  const posts = useInfiniteQuery(postsQueryOptions(currentUserInfo, postsOrderBy, flow));
  const _posts = posts.data?.pages.flatMap((page) => page);
  const router = useRouter();
  return (
    <div className="flex flex-col gap-4 py-24 sm:max-w-[512px] mx-auto">
      <AddPostBar currentUserInfo={currentUserInfo} />
      <PostsOptionsBar router={router} isMyProfile={false}>
        <PostsOrderer
          router={router}
          mostLikes={(flow) => ({ to: "/feed", search: { postsOrderBy: "likes", flow } })}
          mostRecent={(flow) => ({
            to: "/feed",
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
  );
}
