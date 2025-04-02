import { useInfiniteQuery } from "@tanstack/react-query";
import React from "react";
import useAutoLoadNextPage from "../hooks/useAutoLoadNextPage";
import { commentsQueryOptions } from "../queries/comments";
import { Post } from "../server/fn/posts";
import { CurrentUserInfo } from "../server/fn/user";
import CommentCard from "./comment-card";
import { Button } from "./ui/button";

export default function CommentsSection({
  post,
  deepView,
  currentUserInfo,
}: {
  post: Post;
  deepView: boolean;
  currentUserInfo: CurrentUserInfo;
}) {
  const comments = useInfiniteQuery(commentsQueryOptions(post.id));
  const _comments = comments.data?.pages.flatMap((page) => page);

  const { ref, loaderRef } = useAutoLoadNextPage({
    fetchNextPage: () => {
      comments.fetchNextPage();
    },
  });

  if (!_comments) return null;
  return (
    <div
      className={`${!deepView === true && "max-h-[20dvh] h-full overflow-y-scroll scrollbar scrollbar-thumb-foreground/15"}`}
    >
      <div className=" flex flex-col gap-2">
        {_comments?.map((c, i) => {
          if (i === _comments.length - 1)
            return (
              <React.Fragment key={c.id}>
                <CommentCard
                  currentUserInfo={currentUserInfo}
                  key={c.id}
                  commentId={c.id}
                  post={post}
                />
                <div ref={ref} key={c.id}></div>
              </React.Fragment>
            );
          return (
            <CommentCard
              currentUserInfo={currentUserInfo}
              key={c.id}
              commentId={c.id}
              post={post}
            />
          );
        })}
        <Button
          className="text-xs text-muted-foreground font-light"
          hidden={!comments.hasNextPage}
          ref={loaderRef}
          variant={"ghost"}
          onClick={() => {
            comments.fetchNextPage();
          }}
        >
          {comments.isFetchingNextPage ? "Loading..." : "Fetch more comments"}
        </Button>
      </div>
    </div>
  );
}
