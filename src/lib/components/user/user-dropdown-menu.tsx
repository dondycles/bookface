import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { LogOut, Plus, Settings } from "lucide-react";
import authClient from "../../auth-client";
import { CurrentUserInfo } from "../../server/fn/user";
import UpsertPostDialog from "../post/upsert-post-dialog";
import ThemeToggle from "../ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import UserAvatar from "./user-avatar";

export default function UserDropdownMenu({
  currentUserInfo,
}: {
  currentUserInfo: NonNullable<CurrentUserInfo>;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  return (
    <DropdownMenu key={"user"}>
      <DropdownMenuTrigger>
        <UserAvatar
          url={currentUserInfo.dB.image}
          className="size-12"
          username={currentUserInfo.dB.username}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() =>
            router.navigate({
              to: "/$username/posts",
              params: {
                username: currentUserInfo.dB.username ?? "",
              },
              search: {
                flow: "desc",
                postsOrderBy: "recent",
              },
            })
          }
        >
          <UserAvatar
            url={currentUserInfo.dB.image}
            username={currentUserInfo.dB.username}
          />
          <p>{currentUserInfo.dB.name}</p>
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
            await queryClient.invalidateQueries({
              queryKey: ["currentUserInfo"],
            });
            await queryClient.invalidateQueries({
              queryKey: ["currentUserPosts"],
            });
            await queryClient.invalidateQueries({
              queryKey: ["currentUserFriendships"],
            });
            await queryClient.invalidateQueries({
              queryKey: ["currentUserChatRoomIds"],
            });
            await queryClient.invalidateQueries({
              queryKey: ["chatRoom"],
            });
            await queryClient.invalidateQueries({
              queryKey: ["chatRoomChats"],
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
  );
}
