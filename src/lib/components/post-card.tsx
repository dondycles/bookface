import { QueryClient, useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Ellipsis, ThumbsUp } from "lucide-react";
import { CurrentUser } from "../server/fn/auth";
import { deletePost, Post } from "../server/fn/posts";
import UserAvatar from "./avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function PostCard({
  post,
  currentUser,
  queryClient,
  deepView = false,
}: {
  post: Post;
  currentUser: CurrentUser;
  queryClient: QueryClient;
  deepView?: boolean;
}) {
  const removePost = useMutation({
    mutationFn: async (id: string) => deletePost({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
    },
  });
  return (
    <div key={post.id} className={`${!deepView && "border-t sm:border"} sm:rounded-lg`}>
      <div className=" flex flex-col gap-4 py-4 px-2 sm:px-4">
        <div className="flex gap-4 justify-between">
          <div className="flex gap-2 items-stretch">
            <UserAvatar
              className=" size-9"
              url={post.author.image}
              alt={post.author.username ?? post.author.email}
            />
            <div className="text-muted-foreground leading-tight">
              <Link
                className="font-semibold text-foreground"
                to="/$username"
                params={{ username: post.author.username ?? "" }}
              >
                {post.author.username ?? post.author.name}
              </Link>
              <p className="font-mono text-xs">{post.createdAt.toLocaleString()}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Ellipsis className="text-muted-foreground size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link draggable={false} to="/feed/$id" params={{ id: post.id }}>
                <DropdownMenuItem>View</DropdownMenuItem>
              </Link>

              <DropdownMenuItem
                hidden={currentUser?.id !== post.userId}
                onClick={() => {
                  removePost.mutate(post.id);
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="whitespace-pre-wrap">{post.message}</p>
      </div>
      <div className="p-2 sm:border-t">
        <Button variant={"ghost"} size={"icon"} className="text-muted-foreground">
          <ThumbsUp />
        </Button>
      </div>
    </div>
  );
}
