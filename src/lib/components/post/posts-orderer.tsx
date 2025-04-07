import { PostsOrderBy, SearchFlow } from "@/lib/search-schema";
import { AnyRouter, NavigateOptions } from "@tanstack/react-router";
import { Check, ChevronDown, ThumbsDown, ThumbsUp, Timer, TimerOff } from "lucide-react";
import { Button } from "../ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export function PostsOrderer({
  mostRecent,
  mostLikes,
  router,
  flow,
  postsOrderBy,
}: {
  mostRecent: (flow: SearchFlow) => NavigateOptions;
  mostLikes: (flow: SearchFlow) => NavigateOptions;
  router: AnyRouter;
  flow: SearchFlow;
  postsOrderBy: PostsOrderBy;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="text-sm text-muted-foreground w-fit rounded-r-none"
          variant={"ghost"}
        >
          <p>
            {(postsOrderBy === "likes"
              ? flow === "asc"
                ? "Least Liked"
                : "Most Liked"
              : "") ||
              (postsOrderBy === "recent"
                ? flow === "asc"
                  ? "Least Recent"
                  : "Most Recent"
                : "")}
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
                  router.navigate(mostRecent("desc"));
                }}
              >
                <Check
                  className={`${flow === "desc" && postsOrderBy === "recent" ? "opacity-100" : "opacity-0"}`}
                />
                <Timer />
                <p>Most Recent</p>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  router.navigate(mostRecent("asc"));
                }}
              >
                <Check
                  className={`${flow === "asc" && postsOrderBy === "recent" ? "opacity-100" : "opacity-0"}`}
                />
                <TimerOff />
                <p>Least Recent</p>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  router.navigate(mostLikes("desc"));
                }}
              >
                <Check
                  className={`${flow === "desc" && postsOrderBy === "likes" ? "opacity-100" : "opacity-0"}`}
                />

                <ThumbsUp />
                <p>Most Liked</p>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  router.navigate(mostLikes("asc"));
                }}
              >
                <Check
                  className={`${flow === "asc" && postsOrderBy === "likes" ? "opacity-100" : "opacity-0"}`}
                />

                <ThumbsDown />
                <p>Least Liked</p>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
