import authClient from "@/lib/auth-client";
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
import { currentUserInfoQueryOptions } from "../queries/user";
import { CurrentUserInfo } from "../server/fn/user";
import { useDebounce } from "../utils";
import ThemeToggle from "./ThemeToggle";
import UserAvatar from "./avatar";
import SetUsernameDialog from "./set-username-dialog";
import { Input } from "./ui/input";
import UpsertPostDialog from "./upsert-post-dialog";

export default function Nav({
  currentUserInfo: currentUserInfoInitialData,
}: {
  currentUserInfo: CurrentUserInfo;
}) {
  const queryClient = useQueryClient();
  const route = useRouter();
  const { data: currentUserInfo } = useSuspenseQuery({
    ...currentUserInfoQueryOptions(),
    initialData: currentUserInfoInitialData,
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
    <nav className="gap-4  fixed w-full z-10 bg-muted shadow-xl shadow-black/5">
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
              <Link
                to={"/feed"}
                search={{
                  sortBy: "recent",
                }}
                className="text-4xl font-bold leading-none"
              >
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
        {currentUserInfo ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <UserAvatar
                url={currentUserInfo.dB.image}
                className="size-12"
                alt={currentUserInfo.dB.username ?? currentUserInfo.dB.email}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link
                  to="/$username"
                  search={{ sortBy: "recent" }}
                  params={{ username: currentUserInfo.dB.username as string }}
                >
                  <Avatar>
                    <AvatarImage
                      src={currentUserInfo.dB.image ?? "/favicon.ico"}
                      alt="@shadcn"
                    />
                    <AvatarFallback>BF</AvatarFallback>
                  </Avatar>
                  <p>{currentUserInfo.dB.name}</p>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <UpsertPostDialog>
                  <DropdownMenuSubTrigger
                    showIcon={false}
                    className="p-2 flex gap-2 cursor-pointer"
                  >
                    <Plus className="size-4" />
                    <p>New Post</p>
                  </DropdownMenuSubTrigger>
                </UpsertPostDialog>
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
                  await queryClient.invalidateQueries({ queryKey: ["currentUserInfo"] });
                  await queryClient.invalidateQueries({ queryKey: ["currentUserPosts"] });
                  await queryClient.invalidateQueries({
                    queryKey: ["user", currentUserInfo.dB.username],
                  });
                  await router.invalidate();
                }}
              >
                <LogOut className="text-destructive" />
                <p>Log Out</p>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <ThemeToggle className="w-full" />
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
        <SetUsernameDialog currentUserInfo={currentUserInfo} />
      </div>
    </nav>
  );
}
