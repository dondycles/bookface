import authClient from "@/lib/auth-client";
import { Button } from "@/lib/components/ui/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { LogIn, MessageCircleMore, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { currentUserInfoQueryOptions } from "../queries/user";
import { CurrentUserInfo } from "../server/fn/user";
import { useDebounce } from "../utils";
import NotificationDropdown from "./notification-dropdown";
import SetUsernameDialog from "./set-username-dialog";
import { Input } from "./ui/input";
import UserDropdownMenu from "./user/user-dropdown-menu";

export default function Nav({
  currentUserInfo: currentUserInfoInitialData,
}: {
  currentUserInfo: CurrentUserInfo;
}) {
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
        search: {
          q: debouncedQ,
          postsOrderBy: router.state.location.search.postsOrderBy ?? "recent",
          usersOrderBy: router.state.location.search.usersOrderBy ?? "dateJoined",
          flow: "desc",
        },
      });
    }
  }, [
    searching,
    debouncedQ,
    route,
    router.state.location.search.postsOrderBy,
    router.state.location.search.usersOrderBy,
  ]);
  return (
    <nav className="gap-4  fixed w-full z-10 bg-muted border-b">
      <div className="sm:max-w-[512px] mx-auto flex items-center gap-2 justify-between w-full  px-2 sm:px-0  py-4 ">
        <div className="flex gap-2 flex-1 justify-start items-center">
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
                  postsOrderBy: "recent",
                  flow: "desc",
                }}
                className="font-bold"
              >
                <div className="bg-accent rounded-full aspect-square h-12 flex items-center justify-center text-2xl">
                  bf
                </div>
              </Link>
              <Button
                key={"Search"}
                onClick={() => setSearching(true)}
                variant={"ghost"}
                size={"icon"}
              >
                <Search className="size-6" />
              </Button>
            </>
          )}
        </div>
        {currentUserInfo ? (
          <>
            <Link to="/m">
              <Button size={"icon"} variant={"ghost"}>
                <MessageCircleMore className="size-6" />
              </Button>
            </Link>
            <NotificationDropdown currentUserInfo={currentUserInfo} />
            <UserDropdownMenu currentUserInfo={currentUserInfo} />
          </>
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
