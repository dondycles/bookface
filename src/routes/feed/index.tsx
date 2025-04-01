import PostCard from "@/lib/components/post-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/lib/components/ui/avatar";
import { Button } from "@/lib/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/lib/components/ui/dropdown-menu";
import { Input } from "@/lib/components/ui/input";
import UpsertPostDialog from "@/lib/components/upsert-post-dialog";
import useAutoLoadNextPage from "@/lib/hooks/useAutoLoadNextPage";
import { postsQueryOptions } from "@/lib/queries/posts";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { ChevronDown, ThumbsUp, Timer } from "lucide-react";
import { z } from "zod";

const searchSchema = z.object({
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
    return { sortBy: context.search.sortBy, currentUser: context.currentUser };
  },
});

function FeedIndex() {
  const { currentUser, sortBy } = Route.useLoaderData();
  const route = useRouter();
  const posts = useInfiniteQuery(postsQueryOptions(currentUser, sortBy));
  const _posts = posts.data?.pages.flatMap((page) => page);

  const { ref, loaderRef } = useAutoLoadNextPage({
    fetchNextPage: () => {
      posts.fetchNextPage();
    },
  });

  return (
    <div className="flex flex-col gap-4 py-24 sm:max-w-[512px] mx-auto">
      <div hidden={!currentUser}>
        <UpsertPostDialog>
          <div className="flex flex-row gap-2 flex-1 p-2 bg-muted sm:rounded-md">
            <Avatar className="size-9">
              <AvatarImage src={currentUser?.dB?.image ?? "/favicon.ico"} alt="@shadcn" />
              <AvatarFallback>BF</AvatarFallback>
            </Avatar>
            <Input
              placeholder={`What's happening, ${currentUser?.dB?.username ?? currentUser?.dB?.name}?`}
              className="rounded-full flex-1"
            />
          </div>
        </UpsertPostDialog>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="text-sm text-muted-foreground w-fit" variant={"ghost"}>
            <p>Sort By: {sortBy ?? "recent"}</p>
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              route.navigate({
                to: "/feed",
                search: {
                  sortBy: "recent",
                },
              });
            }}
          >
            <Timer />
            <p>Most Recent</p>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              route.navigate({
                to: "/feed",
                search: {
                  sortBy: "likes",
                },
              });
            }}
          >
            <ThumbsUp />
            <p>Most Liked</p>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex flex-col gap-4 h-full w-full ">
        {_posts?.map((post, i) => {
          if (i === _posts.length - 1)
            return (
              <div ref={ref} key={post.id} className="flex-1">
                <PostCard
                  currentUser={currentUser}
                  postId={post.id}
                  key={post.id}
                  deepView={false}
                />
              </div>
            );
          return (
            <div ref={ref} key={post.id} className="flex-1">
              <PostCard
                currentUser={currentUser}
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
