import PostsMapper from "@/lib/components/post/posts-mapper";
import { PostsSorter } from "@/lib/components/post/posts-sorter";
import UserAvatar from "@/lib/components/user-avatar";
import { UsersSorter } from "@/lib/components/users-sorted";
import { searchPostsQueryOptions, searchUsersQueryOptions } from "@/lib/queries/search";
import {
  searchPostsSortBySchema,
  searchQSchema,
  searchUsersSortBySchema,
} from "@/lib/search-schema";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { z } from "zod";

const searchSchema = z.object({
  q: searchQSchema.shape.q,
  postsSortBy: searchPostsSortBySchema.shape.postsSortBy,
  usersSortBy: searchUsersSortBySchema.shape.usersSortBy,
});

export const Route = createFileRoute("/search")({
  component: RouteComponent,
  validateSearch: (search) => searchSchema.parse(search),
  beforeLoad: ({ search }) => {
    if (search.postsSortBy !== "likes" && search.postsSortBy !== "recent") {
      throw redirect({
        to: "/search",
        search: {
          postsSortBy: "recent",
          q: search.q,
          usersSortBy: search.usersSortBy,
        },
      });
    }
    if (search.usersSortBy !== "name" && search.usersSortBy !== "recent") {
      throw redirect({
        to: "/search",
        search: {
          postsSortBy: search.postsSortBy,
          q: search.q,
          usersSortBy: "recent",
        },
      });
    }
    return { search };
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureInfiniteQueryData(
      searchPostsQueryOptions(context.search.q, context.search.postsSortBy),
    );
    await context.queryClient.ensureInfiniteQueryData(
      searchUsersQueryOptions(context.search.q, context.search.usersSortBy),
    );
    return {
      currentUserInfo: context.currentUserInfo,
    };
  },
});

function RouteComponent() {
  const { currentUserInfo } = Route.useLoaderData();
  const { q, postsSortBy, usersSortBy } = Route.useSearch();
  const router = useRouter();
  const postsResults = useInfiniteQuery(searchPostsQueryOptions(q, postsSortBy));
  const usersResults = useInfiniteQuery(searchUsersQueryOptions(q, usersSortBy));
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
              <PostsSorter
                postsSortByState={postsSortBy}
                mostLikes={{
                  to: "/search",
                  search: { postsSortBy: "likes", q, usersSortBy },
                }}
                mostRecent={{
                  to: "/search",
                  search: { postsSortBy: "recent", q, usersSortBy },
                }}
                router={router}
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
            <div className="text-muted-foreground flex gap-2 items-center justify-between bg-muted sm:rounded-md">
              <p className="text-xs pl-2">Users ({_users.length}) </p>
              <UsersSorter
                usersSortByState={usersSortBy}
                alphabetical={{
                  to: "/search",
                  search: { usersSortBy: "name", q, postsSortBy },
                }}
                mostRecent={{
                  to: "/search",
                  search: { usersSortBy: "recent", q, postsSortBy },
                }}
                router={router}
              />
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
                  search={{ postsSortBy: "recent" }}
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
