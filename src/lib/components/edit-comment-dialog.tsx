import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/lib/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { useState } from "react";
import { Comment, editComment } from "../server/fn/comments";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
export default function EditCommentDialog({
  children,
  comment,
}: {
  children: React.ReactNode;
  comment: Comment;
}) {
  const { queryClient } = useRouteContext({ from: "__root__" });
  const [openDialog, setOpenDialog] = useState(false);
  const [message, setMessage] = useState(comment.message);

  const handleEditComment = useMutation({
    mutationFn: async () =>
      editComment({ data: { lastComment: comment, newMessage: message } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comment", comment.id],
      });
      setOpenDialog(false);
      setMessage("");
    },
  });

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Comment</DialogTitle>
          {/* <DialogDescription>Tell 'em what's new.</DialogDescription> */}
        </DialogHeader>
        <Textarea value={message} onChange={(e) => setMessage(e.currentTarget.value)} />
        <DialogFooter>
          <Button
            onClick={async () => {
              handleEditComment.mutate();
            }}
          >
            Edit Comment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
