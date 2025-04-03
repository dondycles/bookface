import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { deleteMultiplePosts } from "../server/fn/posts";
import { useSelectedPostsStore } from "../stores/selected-posts";
import { errorHandlerWithToast, successHandlerWithToast } from "../utils";
import { Button } from "./ui/button";

export default function SelectedPostOptionsFloatingBar() {
  const { posts, reset } = useSelectedPostsStore();
  const queryClient = useQueryClient();
  const handleDeletePosts = useMutation({
    mutationFn: async () => await deleteMultiplePosts({ data: { posts: posts ?? [] } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["currentUserPosts"],
      });
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
      reset();
      successHandlerWithToast("info", "Multiple posts removed");
    },

    onError: (e: Error) => errorHandlerWithToast(e),
  });
  return (
    <div
      className={`fixed bottom-12 w-full left-0 right-0 px-2 flex justify-center ${handleDeletePosts.isPending && "animate-pulse"}`}
      hidden={posts === null}
    >
      <div className="rounded-full bg-accent drop-shadow-md w-full max-w-[512px] overflow-hidden flex justify-between gap-2 items-center text-muted-foreground text-sm">
        <p className="px-2">Selected Posts: {posts?.length}</p>
        <Button onClick={() => handleDeletePosts.mutate()} variant={"ghost"}>
          <Trash2 />
        </Button>
      </div>
    </div>
  );
}
