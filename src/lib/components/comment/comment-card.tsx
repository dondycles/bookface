import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/lib/components/ui/dropdown-menu";
import { Skeleton } from "@/lib/components/ui/skeleton";
import UserAvatar from "@/lib/components/user/user-avatar";
import { commentQueryOptions } from "@/lib/queries/comments";
import { Comment, removeComment } from "@/lib/server/fn/comments";
import { Post } from "@/lib/server/fn/posts";
import { CurrentUserInfo } from "@/lib/server/fn/user";
import { errorHandlerWithToast, successHandlerWithToast } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Delete, Edit, Ellipsis } from "lucide-react";
import EditCommentDialog from "./edit-comment-dialog";

export default function CommentCard({
  commentId,
  currentUserInfo,
  post,
}: {
  commentId: Comment["id"];
  currentUserInfo: CurrentUserInfo;
  post: Post;
}) {
  const queryClient = useQueryClient();
  const { data: comment, isLoading: commentLoading } = useQuery(
    commentQueryOptions(commentId),
  );

  const isAuthorizedToDelete =
    currentUserInfo?.dB.id === comment?.commenterId ||
    currentUserInfo?.dB.id === post.userId;
  const isAuthorizedToEdit = currentUserInfo?.dB.id === comment?.commenterId;
  const isAuthorized = isAuthorizedToDelete || isAuthorizedToEdit;

  const handleRemoveComment = useMutation({
    mutationFn: () => removeComment({ data: { comment: comment!, post } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", comment?.postId],
      });
      successHandlerWithToast("success", "Comment removed");
    },

    onError: (e: Error) => errorHandlerWithToast(e),
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
      <UserAvatar url={comment.commenter.image} username={comment.commenter.username} />
      <div className="rounded-md bg-accent p-2">
        <div className="flex flex-1 gap-2">
          <div className="flex-1">
            <p className="font-semibold">{comment.commenter.username}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger hidden={!isAuthorized}>
              <Ellipsis className="text-muted-foreground size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuSub>
                <EditCommentDialog comment={comment}>
                  <DropdownMenuSubTrigger
                    showIcon={false}
                    className="p-2 flex gap-2 cursor-pointer"
                    hidden={!isAuthorizedToEdit}
                  >
                    <Edit className="size-4 text-muted-foreground" />
                    <p>Edit</p>
                  </DropdownMenuSubTrigger>
                </EditCommentDialog>
              </DropdownMenuSub>

              <DropdownMenuItem
                hidden={!isAuthorizedToDelete}
                onClick={() => handleRemoveComment.mutate()}
              >
                <Delete className="text-destructive" />
                <p className="text-destructive">Delete</p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="whitespace-pre-wrap">{comment.message}</p>
      </div>
    </div>
  );
}
