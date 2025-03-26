import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Ellipsis, ThumbsUp } from "lucide-react";
import { useState } from "react";
import authClient from "~/lib/auth-client";
import AddPostDialog from "~/lib/components/add-post-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "~/lib/components/ui/avatar";
import { Button } from "~/lib/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/lib/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/lib/components/ui/dropdown-menu";
import { Input } from "~/lib/components/ui/input";
import { Separator } from "~/lib/components/ui/separator";
import { postsQueryOptions } from "~/lib/queries/posts";
import { updateUsername } from "~/lib/server/fn/auth";
import { deletePost } from "~/lib/server/fn/posts";
export const Route = createFileRoute("/feed/")({
  component: FeedIndex,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(postsQueryOptions());
    return { user: context.user };
  },
});

function FeedIndex() {
  const { queryClient } = Route.useRouteContext();
  const { user } = Route.useLoaderData();
  const posts = useSuspenseQuery(postsQueryOptions());
  const [username, setUsername] = useState("");

  const removePost = useMutation({
    mutationFn: async (id: string) => deletePost({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
    },
  });

  return (
    <div className="flex flex-col gap-4 py-20 px-2 max-w-[512px] mx-auto">
      <Dialog open={Boolean(user && !user?.username)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Hello, {user?.name}</DialogTitle>
            <DialogDescription>Please input your desired username</DialogDescription>
          </DialogHeader>
          <Input
            className="rounded-full"
            value={username}
            onChange={(e) => setUsername(e.currentTarget.value)}
          />
          <DialogFooter>
            <Button
              onClick={async () => {
                await updateUsername({ data: { username } });
                await authClient.updateUser({
                  username,
                });
                window.location.reload();
              }}
            >
              Set Username
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div hidden={!user}>
        <AddPostDialog queryClient={queryClient}>
          <div className="flex flex-row gap-2 flex-1">
            <Avatar className="size-9">
              <AvatarImage src={user?.image ?? "/favicon.ico"} alt="@shadcn" />
              <AvatarFallback>BF</AvatarFallback>
            </Avatar>
            <Input
              placeholder={`What's happening, ${user?.username ?? user?.name}?`}
              className="rounded-full flex-1"
            />
          </div>
        </AddPostDialog>
      </div>
      <div className="flex flex-col gap-4 h-full w-full">
        {posts.data?.map((post) => {
          return (
            <div key={post.id} className="border rounded-lg">
              <div className=" flex flex-col gap-4 p-4 ">
                <div className="flex gap-4 justify-between">
                  <div className="flex gap-2">
                    <Avatar className="size-9">
                      <AvatarImage
                        src={post.author?.image ?? "/favicon.ico"}
                        alt="@shadcn"
                      />
                      <AvatarFallback>BF</AvatarFallback>
                    </Avatar>
                    <div className="text-muted-foreground text-xs">
                      <Link
                        to="/$username"
                        params={{ username: post.author.username ?? "" }}
                      >
                        {post.author.username ?? post.author.name}
                      </Link>
                      <p>{post.createdAt.toLocaleString()}</p>
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
                        hidden={user?.id !== post.userId}
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
              <Separator />
              <div className="p-2">
                <Button variant={"ghost"} size={"icon"} className="text-muted-foreground">
                  <ThumbsUp />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
