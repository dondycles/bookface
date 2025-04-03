import { SortBy } from "@/routes/feed";
import { NavigateOptions, useRouter } from "@tanstack/react-router";
import { Check, ChevronDown, ThumbsUp, Timer } from "lucide-react";
import { Button } from "./ui/button";
import { Command, CommandGroup, CommandItem, CommandList } from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export default function PostsSorter({
  sortByState,
  mostRecent,
  mostLikes,
}: {
  sortByState: SortBy;
  mostRecent: NavigateOptions;
  mostLikes: NavigateOptions;
}) {
  const route = useRouter();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="text-sm text-muted-foreground w-fit" variant={"ghost"}>
          <p>Sort By: {sortByState ?? "recent"}</p>
          <ChevronDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0" align="end">
        <Command>
          <CommandList>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  route.navigate(mostRecent);
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
                  route.navigate(mostLikes);
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
