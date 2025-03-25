import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Ellipsis, ThumbsUp } from "lucide-react";
import { Button } from "~/lib/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/lib/components/ui/dropdown-menu";
import { Separator } from "~/lib/components/ui/separator";
import { postQueryOptions } from "~/lib/queries/posts";
import { deletePost } from "~/lib/server/fn/posts";

export const Route = createFileRoute("/feed/$id")({
  component: RouteComponent,
  loader: async ({ params: { id }, context }) => {
    const data = await context.queryClient.ensureQueryData(postQueryOptions(id));
    if (!data) throw Error("Post Not Found!");
    return {
      title: data.message,
      user: context.user,
    };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: loaderData.title }] : undefined,
  }),
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { user } = Route.useLoaderData();
  const post = useSuspenseQuery(postQueryOptions(id));
  const { queryClient } = Route.useRouteContext();
  const removePost = useMutation({
    mutationFn: async (id: string) => deletePost({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["post", id],
      });
      window.location.reload();
    },
  });

  if (post.data)
    return (
      <div>
        <div key={post.data.id} className="border rounded-lg">
          <div className=" flex flex-col gap-4 p-4 ">
            <div className="flex gap-4 justify-between">
              <div className="text-muted-foreground text-xs">
                <p>{post.data.author.email}</p>
                <p>{post.data.createdAt.toLocaleString()}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Ellipsis className="text-muted-foreground size-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    hidden={user?.id !== post.data.userId}
                    onClick={() => {
                      removePost.mutate(id);
                    }}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className="whitespace-pre-wrap">{post.data.message}</p>
          </div>
          <Separator />
          <div className="p-2">
            <Button variant={"ghost"} size={"icon"} className="text-muted-foreground">
              <ThumbsUp />
            </Button>
          </div>
        </div>
      </div>
    );
}
