import { UsersSortBy } from "@/lib/search-schema";
import { AnyRouter, NavigateOptions } from "@tanstack/react-router";
import { ArrowDownAZ, Check, ChevronDown, Timer } from "lucide-react";
import { Button } from "./ui/button";
import { Command, CommandGroup, CommandItem, CommandList } from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export function UsersSorter({
  usersSortByState,
  alphabetical,
  mostRecent,
  router,
}: {
  usersSortByState: UsersSortBy;
  alphabetical: NavigateOptions;
  mostRecent: NavigateOptions;
  router: AnyRouter;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="text-sm text-muted-foreground w-fit" variant={"ghost"}>
          <p>
            {(usersSortByState === "name" && "Alphabetical") ||
              (usersSortByState === "recent" && "Most Recent")}
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
                  className={`${usersSortByState === "recent" ? "opacity-100" : "opacity-0"}`}
                />
                <Timer />
                <p>Most Recent</p>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  router.navigate(alphabetical);
                }}
              >
                <Check
                  className={`${usersSortByState === "name" ? "opacity-100" : "opacity-0"}`}
                />

                <ArrowDownAZ />
                <p>Alphabetical</p>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
