import { SortBy } from "@/lib/global-schema";
import { NavigateOptions, useRouter } from "@tanstack/react-router";
import { ListChecks, X } from "lucide-react";
import { useEffect } from "react";
import { useSelectedPostsStore } from "../../stores/selected-posts";
import { Button } from "../ui/button";
import { PostsSorter } from "./posts-sorter";

export default function PostsOptionsBar({
  sortByState,
  mostRecent,
  mostLikes,
  isMyProfile,
}: {
  sortByState: SortBy;
  mostRecent: NavigateOptions;
  mostLikes: NavigateOptions;
  isMyProfile: boolean;
}) {
  const router = useRouter();
  const { setIsSelecting, isSelecting, reset } = useSelectedPostsStore();

  useEffect(() => reset(), [reset, router.state.location.pathname]);

  return (
    <div className="sm:rounded-md bg-muted flex justify-between text-muted-foreground gap-2">
      <PostsSorter
        mostLikes={mostLikes}
        mostRecent={mostRecent}
        sortByState={sortByState}
        router={router}
      />
      <Button
        onClick={() => {
          if (!isMyProfile || router.state.location.pathname === "feed") return;
          setIsSelecting();
          if (isSelecting) reset();
        }}
        hidden={!isMyProfile || router.state.location.pathname === "feed"}
        variant={"ghost"}
        size={"icon"}
      >
        {isSelecting ? <X /> : <ListChecks />}
      </Button>
    </div>
  );
}
