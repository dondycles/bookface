import UserAvatar from "@/lib/components/avatar";
import PostCard from "@/lib/components/post-card";
import { searchResultsQueryOptions } from "@/lib/queries/search";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

export const Route = createFileRoute("/search")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): { q: string } => {
    // validate and parse the search params into a typed state
    return {
      q: search.q as string,
    };
  },
  beforeLoad: ({ search }) => {
    return { search };
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      searchResultsQueryOptions(context.search.q),
    );
    return { q: context.search.q, currentUserInfo: context.currentUserInfo };
  },
});

function RouteComponent() {
  const { currentUserInfo } = Route.useLoaderData();
  const { q } = Route.useSearch();
  const { data: searchResults } = useSuspenseQuery(searchResultsQueryOptions(q));
  return (
    <div className="flex flex-col gap-4 py-24 sm:max-w-[512px] mx-auto">
      <p className="px-2 sm:px-0">
        Results for <em>`{q}`</em>{" "}
      </p>
      {searchResults.posts.length > 0 ? (
        <div className="border-t pt-2 px-2 sm:px-0 text-muted-foreground text-sm">
          Posts ({searchResults.posts.length}){" "}
        </div>
      ) : null}
      {searchResults.posts.map((p) => {
        return (
          <PostCard
            key={p.id}
            currentUserInfo={currentUserInfo}
            deepView={false}
            postId={p.id}
          />
        );
      })}
      {searchResults.users.length > 0 ? (
        <div className="border-t pt-2 px-2 sm:px-0 text-muted-foreground text-sm">
          Users ({searchResults.users.length}){" "}
        </div>
      ) : null}
      {searchResults.users.map((u) => {
        return (
          <div
            key={u.id}
            className="sm:rounded-md bg-muted py-4 px-2 sm:px-4 flex gap-2 justify-between"
          >
            <div className="flex gap-2 items-center">
              <UserAvatar className="size-14" alt={u.username ?? u.email} url={u.image} />
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
    </div>
  );
}
