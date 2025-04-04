import PostsMapper from "@/lib/components/post/posts-mapper";
import PostsOptionsBar from "@/lib/components/post/posts-options-bar";
import UserAvatar from "@/lib/components/user-avatar";
import { searchQSchema, searchSortBySchema } from "@/lib/global-schema";
import { searchPostsQueryOptions, searchUsersQueryOptions } from "@/lib/queries/search";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { z } from "zod";

const searchSchema = z.object({
  q: searchQSchema.shape.q,
  sortBy: searchSortBySchema.shape.sortBy,
});

export const Route = createFileRoute("/search")({
  component: RouteComponent,
  validateSearch: (search) => searchSchema.parse(search),
  beforeLoad: ({ search }) => {
    if (search.sortBy !== "likes" && search.sortBy !== "recent") {
      throw redirect({
        to: "/search",
        search: {
          sortBy: "recent",
          q: search.q,
        },
      });
    }
    return { search };
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureInfiniteQueryData(
      searchPostsQueryOptions(context.search.q, context.search.sortBy),
    );
    await context.queryClient.ensureInfiniteQueryData(
      searchUsersQueryOptions(context.search.q, context.search.sortBy),
    );
    return {
      q: context.search.q,
      currentUserInfo: context.currentUserInfo,
    };
  },
});

function RouteComponent() {
  const { currentUserInfo } = Route.useLoaderData();
  const { q, sortBy } = Route.useSearch();
  const postsResults = useInfiniteQuery(searchPostsQueryOptions(q, sortBy));
  const usersResults = useInfiniteQuery(searchUsersQueryOptions(q, sortBy));
  const _posts = postsResults.data?.pages.flatMap((page) => page);
  const _users = usersResults.data?.pages.flatMap((page) => page);
  return (
    <div className="flex flex-col gap-4 py-24 sm:max-w-[512px] mx-auto">
      <p className="px-2 sm:px-0">
        Results for <em>`{q}`</em>{" "}
      </p>
      {_posts ? (
        <>
          {_posts.length > 0 ? (
            <div className="text-muted-foreground flex gap-2 items-center justify-between bg-muted sm:rounded-md">
              <p className="text-xs pl-2">Posts Result ({_posts.length}) </p>
              <PostsOptionsBar
                sortByState={sortBy}
                mostLikes={{ to: "/search", search: { sortBy: "likes", q } }}
                mostRecent={{ to: "/search", search: { sortBy: "recent", q } }}
                isMyProfile={false}
              />
            </div>
          ) : null}
          <PostsMapper
            _posts={_posts}
            fetchNextPage={() => postsResults.fetchNextPage()}
            hasNextPage={postsResults.hasNextPage}
            isFetchingNextPage={postsResults.isFetchingNextPage}
            currentUserInfo={currentUserInfo}
          />
        </>
      ) : null}
      {_users ? (
        <>
          {_users.length > 0 ? (
            <div className="border-t pt-2 px-2 sm:px-0 text-muted-foreground text-sm">
              Users ({_users.length}){" "}
            </div>
          ) : null}
          {_users.map((u) => {
            return (
              <div
                key={u.id}
                className="sm:rounded-md bg-muted py-4 px-2 sm:px-4 flex gap-2 justify-between"
              >
                <div className="flex gap-2 items-center">
                  <UserAvatar
                    className="size-14"
                    alt={u.username ?? u.email}
                    url={u.image}
                  />
                  <div>
                    <p className="font-semibold text-lg">{u.name}</p>
                    <p className="text-muted-foreground">@{u.username}</p>
                  </div>
                </div>
                <Link
                  to="/$username"
                  search={{ sortBy: "recent" }}
                  params={{ username: u.username ?? "" }}
                >
                  <ExternalLink className="text-muted-foreground size-5" />
                </Link>
              </div>
            );
          })}
        </>
      ) : null}
    </div>
  );
}
