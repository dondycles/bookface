import { SortBy } from "@/routes/feed";
import { NavigateOptions, useRouter } from "@tanstack/react-router";
import { ChevronDown, ThumbsUp, Timer } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="text-sm text-muted-foreground w-fit" variant={"ghost"}>
          <p>Sort By: {sortByState ?? "recent"}</p>
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => {
            route.navigate(mostRecent);
          }}
        >
          <Timer />
          <p>Most Recent</p>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            route.navigate(mostLikes);
          }}
        >
          <ThumbsUp />
          <p>Most Liked</p>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
