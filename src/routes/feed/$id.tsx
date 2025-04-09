import PostCard from "@/lib/components/post/post-card";
import { postQueryOptions } from "@/lib/queries/posts";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/feed/$id")({
  component: RouteComponent,

  loader: async ({ params: { id }, context: { currentUserInfo, queryClient } }) => {
    const data = await queryClient.ensureQueryData(postQueryOptions(id));
    if (!data) throw Error("Post Not Found!");
    return {
      title: data.message,
      postId: id,
      currentUserInfo,
    };
  },

  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: loaderData.title }] : undefined,
  }),
});

function RouteComponent() {
  const { currentUserInfo, postId } = Route.useLoaderData();

  return (
    <div className="pt-20 sm:pt-24 sm:max-w-[512px] mx-auto">
      <PostCard currentUserInfo={currentUserInfo} deepView={true} postId={postId} />
    </div>
  );
}
