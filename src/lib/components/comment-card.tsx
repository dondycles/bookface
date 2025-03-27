import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { Ellipsis } from "lucide-react";
import { commentQueryOptions } from "../queries/comments";
import { Comment, removeComment } from "../server/fn/comments";
import UserAvatar from "./avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";

export default function CommentCard({ commentId }: { commentId: Comment["id"] }) {
  const { currentUser, queryClient } = useRouteContext({
    from: "__root__",
  });
  const { data: comment, isLoading: commentLoading } = useQuery(
    commentQueryOptions(commentId),
  );

  const handleRemoveComment = useMutation({
    mutationFn: () => removeComment({ data: { commentId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", comment?.postId],
      });
    },
  });
  if (!comment) return null;
  if (commentLoading)
    return (
      <div className="flex gap-2">
        <Skeleton className="size-9 aspect-square rounded-full" />
        <Skeleton className="w-full h-14" />
      </div>
    );
  return (
    <div
      key={comment.id}
      className={`${handleRemoveComment.isPending && "animate-pulse "} last:mb-2 flex gap-2`}
    >
      <UserAvatar url={comment.commenter.image} alt={comment.commenter.name} />
      <div className="rounded-md bg-muted p-2">
        <div className="flex flex-1 gap-2">
          <div className="flex-1">
            <p className="font-semibold">{comment.commenter.username}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Ellipsis className="text-muted-foreground size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                hidden={currentUser?.id !== comment.commenterId}
                onClick={() => handleRemoveComment.mutate()}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="whitespace-pre-wrap">{comment.message}</p>
      </div>
    </div>
  );
}
