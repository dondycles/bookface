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
import { QueryClient } from "@tanstack/react-query";
import { Link, useRouteContext, useRouter } from "@tanstack/react-router";
import { LogIn, LogOut, Plus, Search, Settings } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import UserAvatar from "./avatar";

export default function Nav({ queryClient }: { queryClient: QueryClient }) {
  const { currentUser } = useRouteContext({ from: "__root__" });
  const router = useRouter();
  return (
    <nav className="gap-4 flex items-center justify-between fixed w-full bg-background px-2 sm:px-4 py-2 z-10 border-b">
      <div className="flex gap-2">
        <Link to={"/feed"} className="text-4xl font-bold">
          bookface
        </Link>
        <Button variant={"ghost"} className="aspect-square h-fit">
          <Search className="size-6" />
        </Button>
      </div>
      {currentUser ? (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <UserAvatar
              url={currentUser.image}
              className="size-12"
              alt={currentUser.username ?? currentUser.email}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/$username" params={{ username: currentUser.username as string }}>
                <Avatar>
                  <AvatarImage src={currentUser.image ?? "/favicon.ico"} alt="@shadcn" />
                  <AvatarFallback>BF</AvatarFallback>
                </Avatar>
                <p>{currentUser.name}</p>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <AddPostDialog queryClient={queryClient}>
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
                await queryClient.invalidateQueries({ queryKey: ["user"] });
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
    </nav>
  );
}
