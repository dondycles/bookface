import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Ellipsis, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { Button } from "~/lib/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/lib/components/ui/dropdown-menu";
import { ScrollArea } from "~/lib/components/ui/scroll-area";
import { Separator } from "~/lib/components/ui/separator";
import { Textarea } from "~/lib/components/ui/textarea";
import { postsQueryOptions } from "~/lib/queries/posts";
import { addPost, deletePost } from "~/lib/server/fn/posts";
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
  const [message, setMessage] = useState("");

  const submitPost = useMutation({
    mutationFn: async () => addPost({ data: { message } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
    },
  });

  const removePost = useMutation({
    mutationFn: async (id: string) => deletePost({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
    },
  });

  return (
    <ScrollArea className="h-[100dvh] overflow-auto">
      <div className="flex flex-col gap-4 ">
        <div className="flex gap-4" hidden={!user}>
          <Textarea value={message} onChange={(v) => setMessage(v.currentTarget.value)} />
          <Button
            className="aspect-square h-fit"
            onClick={async () => {
              submitPost.mutate();
            }}
          >
            Post
          </Button>
        </div>
        <div className="flex flex-col gap-4 h-full w-full">
          {posts.data?.map((post) => {
            return (
              <div key={post.id} className="border rounded-lg">
                <div className=" flex flex-col gap-4 p-4 ">
                  <div className="flex gap-4 justify-between">
                    <div className="text-muted-foreground text-xs">
                      <p>{post.author.email}</p>
                      <p>{post.createdAt.toLocaleString()}</p>
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
                  <Button
                    variant={"ghost"}
                    size={"icon"}
                    className="text-muted-foreground"
                  >
                    <ThumbsUp />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}
