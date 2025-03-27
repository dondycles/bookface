import PostCard from "@/lib/components/post-card";
import { postQueryOptions } from "@/lib/queries/posts";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/feed/$id")({
  component: RouteComponent,
  loader: async ({ params: { id }, context }) => {
    const data = await context.queryClient.ensureQueryData(postQueryOptions(id));
    if (!data) throw Error("Post Not Found!");
    return {
      title: data.message,
      currentUser: context.currentUser,
    };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: loaderData.title }] : undefined,
  }),
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { currentUser } = Route.useLoaderData();
  const { queryClient } = Route.useRouteContext();

  return (
    <div className="py-20 max-w-[512px] mx-auto">
      <PostCard
        deepView={true}
        queryClient={queryClient}
        currentUser={currentUser}
        postId={id}
      />
    </div>
  );
}
