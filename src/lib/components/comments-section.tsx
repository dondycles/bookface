import { useQuery } from "@tanstack/react-query";
import { commentsQueryOptions } from "../queries/comments";
import { Post } from "../server/fn/posts";
import CommentCard from "./comment-card";

export default function CommentsSection({
  postId,
  deepView,
}: {
  postId: Post["id"];
  deepView: boolean;
}) {
  const { data: comments } = useQuery(commentsQueryOptions(postId));
  if (!comments) return null;
  return (
    <div
      className={`${!deepView === true && "max-h-[50dvh] h-full overflow-y-scroll scrollbar scrollbar-thumb-foreground/15"}`}
    >
      <div className=" flex flex-col gap-2">
        {comments.map((c) => {
          return <CommentCard key={c.id} commentId={c.id} />;
        })}
      </div>
    </div>
  );
}
