import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Ellipsis, ThumbsUp } from "lucide-react";
import { postQueryOptions } from "../queries/posts";
import { CurrentUser } from "../server/fn/auth";
import { deletePost, likePost, Post, unlikePost } from "../server/fn/posts";
import UserAvatar from "./avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";

export default function PostCard({
  postId,
  currentUser,
  queryClient,
  deepView = false,
}: {
  postId: Post["id"];
  currentUser: CurrentUser;
  queryClient: QueryClient;
  deepView?: boolean;
}) {
  const { data: post, isLoading: postLoading } = useQuery(postQueryOptions(postId));
  const isLiked = post?.likers.some((l) => l.likerId === currentUser?.id);
  const handleRemovePost = useMutation({
    mutationFn: async (id: string) => await deletePost({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
    },
  });
  const handleLikePost = useMutation({
    mutationFn: async (id: string) => {
      await likePost({ data: { postId: id } });
      return { id };
    },
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({
        queryKey: ["post", id],
      });
    },
  });
  const handleUnlikePost = useMutation({
    mutationFn: async (id: string) => {
      await unlikePost({ data: { postId: id } });
      return { id };
    },
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({
        queryKey: ["post", id],
      });
    },
  });
  if (postLoading)
    return (
      <div
        className={`${!deepView && "border-t sm:border"} sm:rounded-lg w-full py-4 px-2 sm:px-4 flex flex-col gap-4`}
      >
        <div className="flex gap-2">
          <Skeleton className="size-9 aspect-square rounded-full" />
          <div className="flex gap-2 flex-col">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-24 h-2" />
          </div>
        </div>
        <Skeleton className="w-full h-24" />
      </div>
    );
  if (!post) return null;
  return (
    <div key={post.id} className={`${!deepView && "border-t sm:border"} sm:rounded-lg`}>
      <div
        className={`flex flex-col gap-4 py-4 px-2 sm:px-4 ${handleRemovePost.isPending && "animate-pulse"}`}
      >
        <div className="flex gap-4 justify-between">
          <div className="flex gap-2 items-stretch">
            <UserAvatar
              className=" size-9"
              url={post.author.image}
              alt={post.author.username ?? post.author.email}
            />
            <div className="text-muted-foreground leading-tight">
              <Link
                className="font-semibold text-foreground"
                to="/$username"
                params={{ username: post.author.username ?? "" }}
              >
                {post.author.username ?? post.author.name}
              </Link>
              <p className="font-mono text-xs">{post.createdAt.toLocaleString()}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Ellipsis className="text-muted-foreground size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link draggable={false} to="/feed/$id" params={{ id: post.id }}>
                <DropdownMenuItem>View</DropdownMenuItem>
              </Link>

              <DropdownMenuItem
                hidden={currentUser?.id !== post.userId}
                onClick={() => {
                  handleRemovePost.mutate(post.id);
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="whitespace-pre-wrap">{post.message}</p>
      </div>
      <div className="p-2 sm:border-t">
        <Button
          onClick={async () =>
            isLiked ? handleUnlikePost.mutate(post.id) : handleLikePost.mutate(post.id)
          }
          variant={"ghost"}
          className={`text-muted-foreground ${handleUnlikePost.isPending || (handleLikePost.isPending && "animate-pulse")}`}
        >
          <ThumbsUp
            className={`${isLiked && "fill-accent-foreground stroke-background"}`}
          />{" "}
          {post.likers.length}
        </Button>
      </div>
    </div>
  );
}
