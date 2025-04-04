import { SearchFlow, UsersOrderBy } from "@/lib/search-schema";
import { AnyRouter, NavigateOptions } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Check, ChevronDown, LetterText, Timer } from "lucide-react";
import { Button } from "./ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export function UsersOrderer({
  usersOrderByState,
  fullName,
  dateJoined,
  userName,
  router,
  flowState,
}: {
  usersOrderByState: UsersOrderBy;
  fullName: (flow: SearchFlow) => NavigateOptions;
  dateJoined: (flow: SearchFlow) => NavigateOptions;
  userName: (flow: SearchFlow) => NavigateOptions;
  router: AnyRouter;
  flowState: SearchFlow;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="text-sm text-muted-foreground w-fit" variant={"ghost"}>
          <p>
            {(usersOrderByState === "fullName" && "Full name") ||
              (usersOrderByState === "dateJoined" && "Date joined") ||
              (usersOrderByState === "userName" && "User Name")}
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
                  router.navigate(dateJoined(flowState));
                }}
              >
                <Check
                  className={`${usersOrderByState === "dateJoined" ? "opacity-100" : "opacity-0"}`}
                />
                <Timer />
                <p>Date Joined</p>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  router.navigate(userName(flowState));
                }}
              >
                <Check
                  className={`${usersOrderByState === "userName" ? "opacity-100" : "opacity-0"}`}
                />

                <LetterText />
                <p>Username</p>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  router.navigate(fullName(flowState));
                }}
              >
                <Check
                  className={`${usersOrderByState === "fullName" ? "opacity-100" : "opacity-0"}`}
                />

                <LetterText />
                <p>Full Name</p>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  if (usersOrderByState === "dateJoined") {
                    router.navigate(dateJoined("asc"));
                  }
                  if (usersOrderByState === "fullName") {
                    router.navigate(fullName("asc"));
                  }
                  if (usersOrderByState === "userName") {
                    router.navigate(userName("asc"));
                  }
                }}
              >
                <Check
                  className={`${flowState === "asc" ? "opacity-100" : "opacity-0"}`}
                />
                <ArrowDown />
                <p>Ascending</p>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  if (usersOrderByState === "dateJoined") {
                    router.navigate(dateJoined("desc"));
                  }
                  if (usersOrderByState === "fullName") {
                    router.navigate(fullName("desc"));
                  }
                  if (usersOrderByState === "userName") {
                    router.navigate(userName("desc"));
                  }
                }}
              >
                <Check
                  className={`${flowState === "desc" ? "opacity-100" : "opacity-0"}`}
                />
                <ArrowUp />
                <p>Descending</p>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
