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
import { editPost, Post } from "../server/fn/posts";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
export default function EditPostDialog({
  children,
  post,
}: {
  children: React.ReactNode;
  post: Post;
}) {
  const { queryClient } = useRouteContext({ from: "__root__" });
  const [openDialog, setOpenDialog] = useState(false);
  const [message, setMessage] = useState(post.message);

  const handleEditPost = useMutation({
    mutationFn: async () => editPost({ data: { lastPost: post, newMessage: message } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["post", post.id],
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
          <DialogTitle>Edit Post</DialogTitle>
          {/* <DialogDescription>Tell 'em what's new.</DialogDescription> */}
        </DialogHeader>
        <Textarea value={message} onChange={(e) => setMessage(e.currentTarget.value)} />
        <DialogFooter>
          <Button
            className={`${handleEditPost.isPending && "animate-pulse cursor-progress"}`}
            onClick={async () => {
              handleEditPost.mutate();
            }}
          >
            Edit Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
