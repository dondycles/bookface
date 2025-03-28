import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Delete,
  Edit,
  Ellipsis,
  ExternalLink,
  MessageCircle,
  Send,
  ThumbsUp,
  X,
} from "lucide-react";
import { useState } from "react";
import { postQueryOptions } from "../queries/posts";
import { addComment } from "../server/fn/comments";
import { addLikePost, removeLikePost } from "../server/fn/likes";
import { deletePost, Post } from "../server/fn/posts";
import { CurrentUser } from "../server/fn/user";
import UserAvatar from "./avatar";
import CommentsSection from "./comments-section";
import EditPostDialog from "./edit-post-dialog";
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
import { Textarea } from "./ui/textarea";
export default function PostCard({
  postId,
  currentUser,
  deepView = false,
}: {
  postId: Post["id"];

  deepView?: boolean;
  currentUser: CurrentUser;
}) {
  const queryClient = useQueryClient();
  const { data: post, isLoading: postLoading } = useQuery(postQueryOptions(postId));
  const [collapseComments, setCollapesComments] = useState(false);
  const [commentMessage, setCommentMessage] = useState("");
  const isLiked = post?.likers.some((l) => l.likerId === currentUser?.dB.id);
  const handleRemovePost = useMutation({
    mutationFn: async (id: string) => await deletePost({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["currentUser"],
      });
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
    },
  });
  const handleLikePost = useMutation({
    mutationFn: async () => await addLikePost({ data: { postId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["post", postId],
      });
    },
  });
  const handleUnlikePost = useMutation({
    mutationFn: async () => await removeLikePost({ data: { postId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["post", postId],
      });
    },
  });
  const handleAddCommentToPost = useMutation({
    mutationFn: async () =>
      await addComment({ data: { message: commentMessage, postId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", postId],
      });
      setCommentMessage("");
    },
  });
  // useEffect(() => {
  //   if (post) {
  //     // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
  //     if (post.comments.length) setCollapesComments(true);
  //   }
  // }, [post, post?.comments.length]);
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
                <EditPostDialog post={post}>
                  <DropdownMenuSubTrigger
                    showIcon={false}
                    className="p-2 flex gap-2 cursor-pointer"
                    hidden={currentUser?.dB.id !== post.userId}
                  >
                    <Edit className="size-4 text-muted-foreground" />
                    <p>Edit</p>
                  </DropdownMenuSubTrigger>
                </EditPostDialog>
              </DropdownMenuSub>

              <DropdownMenuItem
                hidden={currentUser?.dB.id !== post.userId}
                onClick={() => {
                  handleRemovePost.mutate(post.id);
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
            <div
              className={`flex-1 flex gap-2 ${handleAddCommentToPost.isPaused && "animate-pulse"}`}
            >
              <Textarea
                value={commentMessage}
                onChange={(e) => setCommentMessage(e.currentTarget.value)}
                placeholder="Give some of your thoughts"
              />
              <div className="flex flex-col gap-2 justify-end">
                <Button
                  onClick={() => handleAddCommentToPost.mutate()}
                  variant={"secondary"}
                  size={"icon"}
                >
                  <Send />
                </Button>
                <CollapsibleTrigger asChild>
                  <Button variant={"secondary"} size={"icon"}>
                    <X className="text-destructive" />
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
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
            currentUser={currentUser}
            deepView={deepView}
            postId={postId}
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
