import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Ellipsis, ThumbsUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/lib/components/ui/avatar";
import { Button } from "~/lib/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/lib/components/ui/dropdown-menu";
import { Separator } from "~/lib/components/ui/separator";
import { userQueryOptions } from "~/lib/queries/user";

export const Route = createFileRoute("/$username")({
  component: RouteComponent,
  loader: ({ params, context }) => {
    return {
      username: params.username,
      user: context.user,
    };
  },
});

function RouteComponent() {
  const { user, username } = Route.useLoaderData();
  const profile = useSuspenseQuery(userQueryOptions(username));

  return (
    <div className="py-20 max-w-[512px] mx-auto">
      {!profile.data ? (
        <>User not found!</>
      ) : (
        <div className="px-2 sm:px-4 flex flex-col gap-4">
          <div className="flex gap-4">
            <Avatar className="size-24">
              <AvatarImage src={profile.data.image ?? "/favicon.ico"} alt="@shadcn" />
              <AvatarFallback>BF</AvatarFallback>
            </Avatar>
            <div className="flex flex-col ">
              <p className="text-2xl font-bold">{profile.data.name}</p>
              <div className="text-muted-foreground flex flex-col justify-between flex-1">
                <p>@{profile.data.username}</p>
                <p>Joined {profile.data.createdAt.toLocaleString()}</p>
              </div>
            </div>
          </div>
          {profile.data.posts?.map((post) => {
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
                        <p>{post.author.username ?? post.author.name}</p>
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
                            // removePost.mutate(post.id);
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
      )}
    </div>
  );
}
