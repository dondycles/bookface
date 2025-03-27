import authClient from "@/lib/auth-client";
import AddPostDialog from "@/lib/components/add-post-dialog";
import PostCard from "@/lib/components/post-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/lib/components/ui/avatar";
import { Button } from "@/lib/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/lib/components/ui/dialog";
import { Input } from "@/lib/components/ui/input";
import { postsQueryOptions } from "@/lib/queries/posts";
import { updateUsername } from "@/lib/server/fn/auth";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
export const Route = createFileRoute("/feed/")({
  component: FeedIndex,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(postsQueryOptions());
    return { currentUser: context.currentUser };
  },
});

function FeedIndex() {
  const { queryClient } = Route.useRouteContext();
  const { currentUser } = Route.useLoaderData();
  const posts = useSuspenseQuery(postsQueryOptions());
  const [username, setUsername] = useState("");

  return (
    <div className="flex flex-col gap-4 py-20 sm:max-w-[512px] mx-auto">
      <Dialog open={Boolean(currentUser && !currentUser?.username)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Hello, {currentUser?.name}</DialogTitle>
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
      <div hidden={!currentUser}>
        <AddPostDialog>
          <div className="flex flex-row gap-2 flex-1 px-2">
            <Avatar className="size-9">
              <AvatarImage src={currentUser?.image ?? "/favicon.ico"} alt="@shadcn" />
              <AvatarFallback>BF</AvatarFallback>
            </Avatar>
            <Input
              placeholder={`What's happening, ${currentUser?.username ?? currentUser?.name}?`}
              className="rounded-full flex-1"
            />
          </div>
        </AddPostDialog>
      </div>
      <div className="flex flex-col gap-4 h-full w-full sm:px-2 ">
        {posts.data?.map((post) => {
          return (
            <PostCard
              postId={post.id}
              queryClient={queryClient}
              key={post.id}
              deepView={false}
            />
          );
        })}
      </div>
    </div>
  );
}
