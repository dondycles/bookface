import { QueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/lib/components/ui/dialog";
import { addPost } from "../server/fn/posts";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
export default function AddPostDialog({
  queryClient,
  children,
}: {
  queryClient: QueryClient;
  children: React.ReactNode;
}) {
  const [openPostDialog, setOpenPostDialog] = useState(false);
  const [message, setMessage] = useState("");

  const submitPost = useMutation({
    mutationFn: async () => addPost({ data: { message } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
      setOpenPostDialog(false);
      setMessage("");
    },
  });
  return (
    <Dialog open={openPostDialog} onOpenChange={setOpenPostDialog}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New post</DialogTitle>
          <DialogDescription>Tell 'em what's new.</DialogDescription>
        </DialogHeader>
        <Textarea value={message} onChange={(e) => setMessage(e.currentTarget.value)} />
        <DialogFooter>
          <Button
            onClick={async () => {
              submitPost.mutate();
            }}
          >
            Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
