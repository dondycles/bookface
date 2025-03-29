import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Delete, Edit, Ellipsis } from "lucide-react";
import { commentQueryOptions } from "../queries/comments";
import { Comment, removeComment } from "../server/fn/comments";
import { CurrentUser } from "../server/fn/user";
import UserAvatar from "./avatar";
import EditCommentDialog from "./edit-comment-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";

export default function CommentCard({
  commentId,
  currentUser,
}: {
  commentId: Comment["id"];
  currentUser: CurrentUser;
}) {
  const queryClient = useQueryClient();
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
    onError: (e: Error) => {
      alert(JSON.parse(e.message)[0].message as string);
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
      <div className="rounded-md bg-accent p-2">
        <div className="flex flex-1 gap-2">
          <div className="flex-1">
            <p className="font-semibold">{comment.commenter.username}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger hidden={currentUser?.dB.id !== comment.commenterId}>
              <Ellipsis className="text-muted-foreground size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuSub>
                <EditCommentDialog comment={comment}>
                  <DropdownMenuSubTrigger
                    showIcon={false}
                    className="p-2 flex gap-2 cursor-pointer"
                    hidden={currentUser?.dB.id !== comment.commenterId}
                  >
                    <Edit className="size-4 text-muted-foreground" />
                    <p>Edit</p>
                  </DropdownMenuSubTrigger>
                </EditCommentDialog>
              </DropdownMenuSub>

              <DropdownMenuItem
                hidden={currentUser?.dB.id !== comment.commenterId}
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
