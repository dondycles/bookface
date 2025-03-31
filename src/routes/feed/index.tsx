import AddPostDialog from "@/lib/components/add-post-dialog";
import PostCard from "@/lib/components/post-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/lib/components/ui/avatar";
import { Button } from "@/lib/components/ui/button";
import { Input } from "@/lib/components/ui/input";
import useAutoLoadNextPage from "@/lib/hooks/useAutoLoadNextPage";
import { postsQueryOptions } from "@/lib/queries/posts";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/feed/")({
  component: FeedIndex,
});

function FeedIndex() {
  const { currentUser } = Route.useRouteContext();

  const posts = useInfiniteQuery(postsQueryOptions());
  const _posts = posts.data?.pages.flatMap((page) => page);

  const { ref, loaderRef } = useAutoLoadNextPage({
    fetchNextPage: () => {
      posts.fetchNextPage();
    },
  });

  return (
    <div className="flex flex-col gap-4 py-24 sm:max-w-[512px] mx-auto">
      <div hidden={!currentUser}>
        <AddPostDialog>
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
        </AddPostDialog>
      </div>
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
            <PostCard
              currentUser={currentUser}
              postId={post.id}
              key={post.id}
              deepView={false}
            />
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
