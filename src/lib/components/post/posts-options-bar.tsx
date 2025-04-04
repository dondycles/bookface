import { AnyRouter } from "@tanstack/react-router";
import { ListChecks, X } from "lucide-react";
import { useEffect } from "react";
import { useSelectedPostsStore } from "../../stores/selected-posts";
import { Button } from "../ui/button";

export default function PostsOptionsBar({
  isMyProfile,
  router,
  children,
}: {
  isMyProfile: boolean;
  router: AnyRouter;
  children: React.ReactNode;
}) {
  const { setIsSelecting, isSelecting, reset } = useSelectedPostsStore();

  useEffect(() => reset(), [reset, router.state.location.pathname]);

  return (
    <div className="sm:rounded-md bg-muted flex justify-between text-muted-foreground gap-2">
      {children}
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
