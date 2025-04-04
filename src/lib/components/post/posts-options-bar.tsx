import { SortBy } from "@/routes/feed";
import { AnyRouter, NavigateOptions, useRouter } from "@tanstack/react-router";
import { Check, ChevronDown, ListChecks, ThumbsUp, Timer, X } from "lucide-react";
import { useEffect } from "react";
import { useSelectedPostsStore } from "../../stores/selected-posts";
import { Button } from "../ui/button";
import { Command, CommandGroup, CommandItem, CommandList } from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

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

function PostsSorter({
  sortByState,
  mostRecent,
  mostLikes,
  router,
}: {
  sortByState: SortBy;
  mostRecent: NavigateOptions;
  mostLikes: NavigateOptions;
  router: AnyRouter;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="text-sm text-muted-foreground w-fit" variant={"ghost"}>
          <p>
            {(sortByState === "likes" && "Most Liked") ||
              (sortByState === "recent" && "Most Recent")}
          </p>
          <ChevronDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0" align="start" alignOffset={8}>
        <Command>
          <CommandList>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  router.navigate(mostRecent);
                }}
              >
                <Check
                  className={`${sortByState === "recent" ? "opacity-100" : "opacity-0"}`}
                />
                <Timer />
                <p>Most Recent</p>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  router.navigate(mostLikes);
                }}
              >
                <Check
                  className={`${sortByState === "likes" ? "opacity-100" : "opacity-0"}`}
                />

                <ThumbsUp />
                <p>Most Liked</p>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
