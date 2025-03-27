import { useQuery } from "@tanstack/react-query";
import { commentQueryOptions } from "../queries/comments";
import { Comment } from "../server/fn/comments";
import UserAvatar from "./avatar";

export default function CommentCard({ commentId }: { commentId: Comment["id"] }) {
  const { data: comment } = useQuery(commentQueryOptions(commentId));
  if (!comment) return null;
  return (
    <div key={comment.id} className="last:mb-2 flex gap-2">
      <UserAvatar url={comment.commenter.image} alt={comment.commenter.name} />
      <div className="rounded-md bg-muted p-2">
        <p className="font-semibold">{comment.commenter.username}</p>
        <p className="whitespace-pre-wrap">{comment.message}</p>
      </div>
    </div>
  );
}
