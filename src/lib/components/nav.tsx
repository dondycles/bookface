import authClient from "@/lib/auth-client";
import AddPostDialog from "@/lib/components/add-post-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/lib/components/ui/avatar";
import { Button } from "@/lib/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/lib/components/ui/dropdown-menu";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { LogIn, LogOut, Plus, Search, Settings, X } from "lucide-react";
import { useEffect, useState } from "react";
import { currentUserQueryOptions } from "../queries/user";
import { CurrentUser } from "../server/fn/user";
import { useDebounce } from "../utils";
import ThemeToggle from "./ThemeToggle";
import UserAvatar from "./avatar";
import SetUsernameDialog from "./set-username-dialog";
import { Input } from "./ui/input";

export default function Nav({
  currentUser: currentUserInitialData,
}: {
  currentUser: CurrentUser;
}) {
  const queryClient = useQueryClient();
  const route = useRouter();
  const { data: currentUser } = useSuspenseQuery({
    ...currentUserQueryOptions(),
    initialData: currentUserInitialData,
  });
  const router = useRouter();
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 500);

  useEffect(() => {
    if (searching && debouncedQ !== "") {
      route.navigate({
        to: "/search",
        search: { q: debouncedQ },
      });
    }
  }, [searching, debouncedQ, route]);
  return (
    <nav className="gap-4  fixed w-full z-10 bg-muted">
      <div className="sm:max-w-[512px] mx-auto flex items-center justify-between w-full  px-2 sm:px-0  py-4">
        <div className="flex gap-2 flex-1 justify-start">
          {searching ? (
            <>
              <Input
                value={q}
                onChange={(e) => {
                  setQ(e.currentTarget.value);
                }}
                className="max-w-[256px]"
                autoFocus={true}
                placeholder="Search for somethin'"
              />
              <Button
                className="bg-accent"
                size={"icon"}
                onClick={() => {
                  setSearching(false);
                  setQ("");
                }}
                variant={"ghost"}
              >
                <X />
              </Button>
            </>
          ) : (
            <>
              <Link to={"/feed"} className="text-4xl font-bold leading-none">
                bookface
              </Link>
              <Button
                key={"Search"}
                onClick={() => setSearching(true)}
                variant={"ghost"}
                className="aspect-square h-9"
                size={"icon"}
              >
                <Search className="size-6" />
              </Button>
            </>
          )}
        </div>
        {currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <UserAvatar
                url={currentUser.dB.image}
                className="size-12"
                alt={currentUser.dB.username ?? currentUser.dB.email}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link
                  to="/$username"
                  params={{ username: currentUser.dB.username as string }}
                >
                  <Avatar>
                    <AvatarImage
                      src={currentUser.dB.image ?? "/favicon.ico"}
                      alt="@shadcn"
                    />
                    <AvatarFallback>BF</AvatarFallback>
                  </Avatar>
                  <p>{currentUser.dB.name}</p>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <AddPostDialog>
                  <DropdownMenuSubTrigger
                    showIcon={false}
                    className="p-2 flex gap-2 cursor-pointer"
                  >
                    <Plus className="size-4" />
                    <p>New Post</p>
                  </DropdownMenuSubTrigger>
                </AddPostDialog>
              </DropdownMenuSub>

              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings">
                  <Settings />
                  <p>Account Settings</p>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  await authClient.signOut();
                  await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
                  await queryClient.invalidateQueries({
                    queryKey: ["user", currentUser.dB.username],
                  });
                  await router.invalidate();
                }}
              >
                <LogOut className="text-destructive" />
                <p>Log Out</p>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <ThemeToggle />
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            onClick={() =>
              authClient.signIn.social({
                provider: "google",
                callbackURL: "/feed",
              })
            }
            size={"icon"}
          >
            <LogIn />
          </Button>
        )}
        <SetUsernameDialog currentUser={currentUser} />
      </div>
    </nav>
  );
}
