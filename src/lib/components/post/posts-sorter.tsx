import { PostsSortBy } from "@/lib/search-schema";
import { AnyRouter, NavigateOptions } from "@tanstack/react-router";
import { Check, ChevronDown, ThumbsUp, Timer } from "lucide-react";
import { Button } from "../ui/button";
import { Command, CommandGroup, CommandItem, CommandList } from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export function PostsSorter({
  postsSortByState,
  mostRecent,
  mostLikes,
  router,
}: {
  postsSortByState: PostsSortBy;
  mostRecent: NavigateOptions;
  mostLikes: NavigateOptions;
  router: AnyRouter;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="text-sm text-muted-foreground w-fit" variant={"ghost"}>
          <p>
            {(postsSortByState === "likes" && "Most Liked") ||
              (postsSortByState === "recent" && "Most Recent")}
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
                  className={`${postsSortByState === "recent" ? "opacity-100" : "opacity-0"}`}
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
                  className={`${postsSortByState === "likes" ? "opacity-100" : "opacity-0"}`}
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
