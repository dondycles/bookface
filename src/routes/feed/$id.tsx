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
      postId: id,
      currentUser: context.currentUser,
    };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: loaderData.title }] : undefined,
  }),
});

function RouteComponent() {
  const { currentUser, postId } = Route.useLoaderData();

  return (
    <div className="py-24 sm:max-w-[512px] mx-auto">
      <PostCard currentUser={currentUser} deepView={true} postId={postId} />
    </div>
  );
}
