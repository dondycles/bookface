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
import { updateUsername } from "@/lib/server/fn/user";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
export const Route = createFileRoute("/feed/")({
  component: FeedIndex,
});

function FeedIndex() {
  const { currentUser } = Route.useRouteContext();
  const posts = useSuspenseQuery(postsQueryOptions());
  const [username, setUsername] = useState("");

  return (
    <div className="flex flex-col gap-4 py-24 sm:max-w-[512px] mx-auto">
      <Dialog open={Boolean(currentUser && !currentUser.dB?.username)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Hello, {currentUser?.dB?.name}</DialogTitle>
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
          <div className="flex flex-row gap-2 flex-1 p-2 bg-muted sm:rounded-md">
            <Avatar className="size-9">
              <AvatarImage src={currentUser?.dB?.image ?? "/favicon.ico"} alt="@shadcn" />
              <AvatarFallback>BF</AvatarFallback>
            </Avatar>
            <Input
              placeholder={`What's happening, ${currentUser?.dB?.username ?? currentUser?.dB?.name}?`}
              className="rounded-full flex-1"
            />
          </div>
        </AddPostDialog>
      </div>
      <div className="flex flex-col gap-4 h-full w-full ">
        {posts.data?.map((post) => {
          return (
            <PostCard
              currentUser={currentUser}
              postId={post.id}
              key={post.id}
              deepView={false}
            />
          );
        })}
      </div>
    </div>
  );
}
