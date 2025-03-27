import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/lib/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { useState } from "react";
import { addPost } from "../server/fn/posts";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
export default function AddPostDialog({ children }: { children: React.ReactNode }) {
  const { queryClient } = useRouteContext({ from: "__root__" });
  const [openDialog, setOpenDialog] = useState(false);
  const [message, setMessage] = useState("");
  const submitPost = useMutation({
    mutationFn: async () => addPost({ data: { message } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["posts"],
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
          <DialogTitle>New Post</DialogTitle>
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
