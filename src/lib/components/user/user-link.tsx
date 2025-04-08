import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

export default function UserLink({
  username,
  className,
  text,
}: {
  username: string;
  className?: string;
  text: string;
}) {
  return (
    <Link
      to="/$username/posts"
      params={{ username }}
      search={{ flow: "desc", postsOrderBy: "recent" }}
      className={cn("", className)}
    >
      {text}
    </Link>
  );
}
