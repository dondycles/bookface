import PostsMapper from "@/lib/components/post/posts-mapper";
import { PostsOrderer } from "@/lib/components/post/posts-orderer";
import { Button } from "@/lib/components/ui/button";
import UserBar from "@/lib/components/user-bar";
import { UsersOrderer } from "@/lib/components/users-orderer";
import { searchPostsQueryOptions, searchUsersQueryOptions } from "@/lib/queries/search";
import { searchSearchSchema } from "@/lib/search-schema";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/search")({
  component: RouteComponent,
  validateSearch: (search) => searchSearchSchema.parse(search),
  beforeLoad: ({ search }) => {
    if (search.postsOrderBy !== "likes" && search.postsOrderBy !== "recent") {
      throw redirect({
        to: "/search",
        search: {
          postsOrderBy: "recent",
          q: search.q,
          usersOrderBy: search.usersOrderBy,
          flow: search.flow,
        },
      });
    }
    if (
      search.usersOrderBy !== "fullName" &&
      search.usersOrderBy !== "dateJoined" &&
      search.usersOrderBy !== "userName"
    ) {
      throw redirect({
        to: "/search",
        search: {
          postsOrderBy: search.postsOrderBy,
          q: search.q,
          usersOrderBy: "dateJoined",
          flow: search.flow,
        },
      });
    }
    if (search.flow !== "asc" && search.flow !== "desc") {
      throw redirect({
        to: "/search",
        search: {
          postsOrderBy: search.postsOrderBy,
          q: search.q,
          usersOrderBy: search.usersOrderBy,
          flow: "desc",
        },
      });
    }
    return { search };
  },
  loader: async ({
    context: {
      search: { flow, postsOrderBy, q, usersOrderBy },
      queryClient,
      currentUserInfo,
    },
  }) => {
    await queryClient.ensureInfiniteQueryData(
      searchPostsQueryOptions(q, postsOrderBy, flow),
    );
    await queryClient.ensureInfiniteQueryData(
      searchUsersQueryOptions(q, usersOrderBy, flow),
    );
    return {
      currentUserInfo,
    };
  },
});

function RouteComponent() {
  const router = useRouter();
  const { currentUserInfo } = Route.useLoaderData();
  const { q, postsOrderBy, usersOrderBy, flow } = Route.useSearch();

  const [showPosts, setShowPosts] = useState(true);
  const postsResults = useInfiniteQuery(searchPostsQueryOptions(q, postsOrderBy, flow));
  const _posts = postsResults.data?.pages.flatMap((page) => page);

  const [showUsers, setShowUsers] = useState(Boolean(_posts?.length === 0));
  const usersResults = useInfiniteQuery(searchUsersQueryOptions(q, usersOrderBy, flow));
  const _users = usersResults.data?.pages.flatMap((page) => page);

  return (
    <div className="flex flex-col gap-4 py-24 sm:max-w-[512px] mx-auto">
      <p className="px-2 sm:px-0">
        Results for <em>`{q}`</em>{" "}
      </p>
      {_posts ? (
        <>
          {_posts.length > 0 ? (
            <div className="flex-1 flex gap-2">
              <div className="text-muted-foreground flex gap-2 items-center justify-between bg-muted sm:rounded-md flex-1">
                <p className="text-xs pl-2">Posts Result ({_posts.length}) </p>
                {showPosts ? (
                  <PostsOrderer
                    mostLikes={(flow) => ({
                      to: "/search",
                      search: { postsOrderBy: "likes", q, usersOrderBy, flow },
                    })}
                    mostRecent={(flow) => ({
                      to: "/search",
                      search: { postsOrderBy: "recent", q, usersOrderBy, flow },
                    })}
                    router={router}
                    postsOrderBy={postsOrderBy}
                    flow={flow}
                  />
                ) : null}
              </div>
              <Button onClick={() => setShowPosts((prev) => !prev)} variant="secondary">
                {showPosts ? <ChevronUp /> : <ChevronDown />}
              </Button>
            </div>
          ) : null}
          {!showPosts ? null : (
            <PostsMapper
              _posts={_posts}
              fetchNextPage={() => postsResults.fetchNextPage()}
              hasNextPage={postsResults.hasNextPage}
              isFetchingNextPage={postsResults.isFetchingNextPage}
              currentUserInfo={currentUserInfo}
            />
          )}
        </>
      ) : null}
      {_users ? (
        <>
          {_users.length > 0 ? (
            <div className="flex-1 flex gap-2">
              <div className="text-muted-foreground flex gap-2 items-center justify-between bg-muted sm:rounded-md flex-1">
                <p className="text-xs pl-2">Users ({_users.length}) </p>
                {showUsers ? (
                  <UsersOrderer
                    usersOrderByState={usersOrderBy}
                    fullName={(flow) => ({
                      to: "/search",
                      search: { usersOrderBy: "fullName", q, postsOrderBy, flow },
                    })}
                    dateJoined={(flow) => ({
                      to: "/search",
                      search: { usersOrderBy: "dateJoined", q, postsOrderBy, flow },
                    })}
                    userName={(flow) => ({
                      to: "/search",
                      search: { usersOrderBy: "userName", q, postsOrderBy, flow },
                    })}
                    flowState={flow}
                    router={router}
                  />
                ) : null}
              </div>
              <Button onClick={() => setShowUsers((prev) => !prev)} variant="secondary">
                {showUsers ? <ChevronUp /> : <ChevronDown />}
              </Button>
            </div>
          ) : null}
          {!showUsers
            ? null
            : _users.map((u) => {
                return <UserBar u={u} key={`${u}-search`} />;
              })}
        </>
      ) : null}
    </div>
  );
}
