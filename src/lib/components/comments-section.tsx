import { useQuery } from "@tanstack/react-query";
import { commentsQueryOptions } from "../queries/comments";
import { Post } from "../server/fn/posts";
import { CurrentUser } from "../server/fn/user";
import CommentCard from "./comment-card";

export default function CommentsSection({
  postId,
  deepView,
  currentUser,
}: {
  postId: Post["id"];
  deepView: boolean;
  currentUser: CurrentUser;
}) {
  const { data: comments } = useQuery(commentsQueryOptions(postId));
  if (!comments) return null;
  return (
    <div
      className={`${!deepView === true && "max-h-[50dvh] h-full overflow-y-scroll scrollbar scrollbar-thumb-foreground/15"}`}
    >
      <div className=" flex flex-col gap-2">
        {comments.map((c) => {
          return <CommentCard currentUser={currentUser} key={c.id} commentId={c.id} />;
        })}
      </div>
    </div>
  );
}
