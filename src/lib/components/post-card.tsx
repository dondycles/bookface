import { errorHandlerWithToast, successHandlerWithToast } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Delete,
  Edit,
  Ellipsis,
  ExternalLink,
  MessageCircle,
  ThumbsUp,
  X,
} from "lucide-react";
import { useState } from "react";
import { postQueryOptions } from "../queries/posts";
import { addLikePost, removeLikePost } from "../server/fn/likes";
import { deletePost, Post } from "../server/fn/posts";
import { CurrentUserInfo } from "../server/fn/user";
import AddCommentForm from "./add-comment-form";
import UserAvatar from "./avatar";
import CommentsSection from "./comments-section";
import { Button } from "./ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";
import UpsertPostDialog from "./upsert-post-dialog";
export default function PostCard({
  postId,
  currentUserInfo,
  deepView = false,
}: {
  postId: Post["id"];

  deepView?: boolean;
  currentUserInfo: CurrentUserInfo;
}) {
  const queryClient = useQueryClient();
  const { data: post, isLoading: postLoading } = useQuery(postQueryOptions(postId));
  const [collapseComments, setCollapesComments] = useState(false);
  const isLiked = post?.likers.some((l) => l.likerId === currentUserInfo?.dB.id);
  const handleRemovePost = useMutation({
    mutationFn: async () => await deletePost({ data: { post: post! } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["currentUserPosts"],
      });
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
      successHandlerWithToast("info", "Post removed");
    },

    onError: (e: Error) => errorHandlerWithToast(e),
  });
  const handleLikePost = useMutation({
    mutationFn: async () => await addLikePost({ data: { postId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["post", postId],
      });

      successHandlerWithToast("info", "Post liked", {
        label: "Unlike",
        onClick: () => {
          handleUnlikePost.mutate();
        },
      });
    },

    onError: (e: Error) => errorHandlerWithToast(e),
  });
  const handleUnlikePost = useMutation({
    mutationFn: async () => await removeLikePost({ data: { postId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["post", postId],
      });

      successHandlerWithToast("info", "Post unliked", {
        label: "Like",
        onClick: () => {
          handleLikePost.mutate();
        },
      });
    },

    onError: (e: Error) => errorHandlerWithToast(e),
  });

  if (postLoading)
    return (
      <div
        className={`sm:rounded-lg w-full py-4 px-2 sm:px-4 flex flex-col gap-4 bg-muted`}
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
    <div key={post.id} className={`${!deepView && ""} sm:rounded-lg bg-muted`}>
      <div
        className={`flex flex-col gap-4 py-4 px-2 sm:px-4 ${handleRemovePost.isPending && "animate-pulse"}`}
      >
        <div className="flex gap-4 justify-between items-start">
          <div className="flex gap-2 items-stretch">
            <Link
              className="font-semibold text-foreground"
              to="/$username"
              search={{ sortBy: "recent" }}
              params={{ username: post.author.username ?? "" }}
            >
              <UserAvatar
                className=" size-9"
                url={post.author.image}
                alt={post.author.username ?? post.author.email}
              />
            </Link>

            <div className="text-muted-foreground leading-tight">
              <Link
                className="font-semibold text-foreground"
                to="/$username"
                params={{ username: post.author.username ?? "" }}
                search={{ sortBy: "recent" }}
              >
                @{post.author.username ?? post.author.name}
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
                <DropdownMenuItem>
                  <ExternalLink /> View
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSub>
                <UpsertPostDialog post={post}>
                  <DropdownMenuSubTrigger
                    showIcon={false}
                    className="p-2 flex gap-2 cursor-pointer"
                    hidden={currentUserInfo?.dB.id !== post.userId}
                  >
                    <Edit className="size-4 text-muted-foreground" />
                    <p>Edit</p>
                  </DropdownMenuSubTrigger>
                </UpsertPostDialog>
              </DropdownMenuSub>

              <DropdownMenuItem
                hidden={currentUserInfo?.dB.id !== post.userId}
                onClick={() => {
                  handleRemovePost.mutate();
                }}
              >
                <Delete className="text-destructive" />
                <p className="text-destructive">Delete</p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="whitespace-pre-wrap">{post.message}</p>
      </div>

      <Collapsible open={collapseComments} onOpenChange={setCollapesComments}>
        <div className="py-2 px-2 sm:px-3  sm:border-t flex gap-2">
          <Button
            onClick={async () =>
              isLiked ? handleUnlikePost.mutate() : handleLikePost.mutate()
            }
            variant={"ghost"}
            className={`sm:-ml-2 w-10 text-muted-foreground  ${handleUnlikePost.isPending || (handleLikePost.isPending && "animate-pulse")}`}
          >
            <ThumbsUp
              className={`${isLiked && "fill-accent-foreground stroke-background "} size-4`}
            />{" "}
            <span className="text-xs">{post.likers.length}</span>
          </Button>
          {collapseComments ? (
            <AddCommentForm
              postId={postId}
              children={
                <CollapsibleTrigger asChild>
                  <Button variant={"secondary"} size={"icon"}>
                    <X className="text-destructive" />
                  </Button>
                </CollapsibleTrigger>
              }
            />
          ) : (
            <CollapsibleTrigger asChild>
              <Button
                variant={"ghost"}
                className="flex-1 text-muted-foreground bg-accent"
              >
                <MessageCircle /> {post.comments.length}
              </Button>
            </CollapsibleTrigger>
          )}
        </div>
        <CollapsibleContent className="px-2 sm:px-3">
          <CommentsSection
            currentUserInfo={currentUserInfo}
            deepView={deepView}
            post={post}
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
