import useAutoLoadNextPage from "@/lib/hooks/useAutoLoadNextPage";
import { Post } from "@/lib/server/fn/posts";
import { CurrentUserInfo } from "@/lib/server/fn/user";
import { Button } from "../ui/button";
import PostCard from "./post-card";

export default function PostsMapper({
  _posts,
  currentUserInfo,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: {
  _posts: { id: Post["id"] }[] | null | undefined;
  currentUserInfo: CurrentUserInfo;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}) {
  const { ref, loaderRef } = useAutoLoadNextPage({
    fetchNextPage: () => fetchNextPage(),
  });
  if (!_posts) return null;
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-col sm:gap-4 h-full w-full ">
        {_posts.map((post, i) => {
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
        hidden={!hasNextPage}
        ref={loaderRef}
        variant={"ghost"}
        onClick={() => {
          fetchNextPage();
        }}
      >
        {isFetchingNextPage ? "Loading..." : "Fetch more posts"}
      </Button>
    </div>
  );
}
