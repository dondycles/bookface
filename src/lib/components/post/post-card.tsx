import { errorHandlerWithToast, successHandlerWithToast } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  BoxSelect,
  Delete,
  Edit,
  Ellipsis,
  ExternalLink,
  Globe,
  Lock,
  MessageCircle,
  ThumbsUp,
  X,
  XSquare,
} from "lucide-react";
import { useState } from "react";
import { postQueryOptions } from "../../queries/posts";
import { addLikePost, removeLikePost } from "../../server/fn/likes";
import { deletePost, Post } from "../../server/fn/posts";
import { CurrentUserInfo } from "../../server/fn/user";
import { useSelectedPostsStore } from "../../stores/selected-posts";
import AddCommentForm from "../comment/add-comment-form";
import CommentsSection from "../comment/comments-section";
import { Button } from "../ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Skeleton } from "../ui/skeleton";
import UserAvatar from "../user-avatar";
import PostTimeInfo from "./post-time-info";
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

  const {
    posts: selectedPosts,
    selectPost,
    isSelecting,
    reset,
  } = useSelectedPostsStore();
  const isSelected = selectedPosts?.some((p) => p.id === postId) ?? false;

  const isMyPost = currentUserInfo?.dB.id === post?.userId;
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
      <div className={`sm:rounded-lg w-full py-4 px-2 flex flex-col gap-4 bg-muted`}>
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
        className={`flex flex-col gap-4 py-4 px-2  ${handleRemovePost.isPending && "animate-pulse"}`}
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

            <div className="text-muted-foreground leading-tight flex flex-col gap-1">
              <Link
                className="font-semibold text-foreground"
                to="/$username"
                params={{ username: post.author.username ?? "" }}
                search={{ sortBy: "recent" }}
              >
                @{post.author.username ?? post.author.name}
              </Link>
              <div className="flex gap-2 items-center">
                <PostTimeInfo createdAt={post.createdAt} />
                {post.privacy === "private" && <Lock className="size-3 " />}
                {post.privacy === "public" && <Globe className="size-3" />}
              </div>
            </div>
          </div>
          {isSelected ? (
            <button
              onClick={() => {
                if (selectedPosts?.length === 1) return reset();
                selectPost(post);
              }}
              type="button"
            >
              <XSquare className="text-muted-foreground size-5" />
            </button>
          ) : isSelecting ? (
            <button
              onClick={() => {
                selectPost(post);
              }}
              type="button"
            >
              <BoxSelect className="text-muted-foreground size-5" />
            </button>
          ) : (
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
                      hidden={!isMyPost}
                    >
                      <Edit className="size-4 text-muted-foreground" />
                      <p>Edit</p>
                    </DropdownMenuSubTrigger>
                  </UpsertPostDialog>
                </DropdownMenuSub>

                <DropdownMenuItem
                  hidden={!isMyPost}
                  onClick={() => {
                    handleRemovePost.mutate();
                  }}
                >
                  <Delete className="text-destructive" />
                  <p className="text-destructive">Delete</p>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <p className="whitespace-pre-wrap">{post.message}</p>
      </div>

      <Collapsible open={collapseComments} onOpenChange={setCollapesComments}>
        <div className="py-2 px-2 sm:pl-3  sm:border-t flex gap-2">
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
