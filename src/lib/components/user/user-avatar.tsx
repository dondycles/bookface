import { Link } from "@tanstack/react-router";
import { cn } from "../../utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function UserAvatar({
  className,
  url,
  username,
}: {
  className?: string | undefined;
  url: string | null | undefined;
  username: string | null | undefined;
}) {
  if (username)
    return (
      <Link
        to="/$username/posts"
        params={{
          username,
        }}
        search={{ flow: "desc", postsOrderBy: "recent" }}
      >
        <Avatar className={cn("outline outline-accent", className)}>
          <AvatarImage src={url ?? "favicon.ico"} alt={username} />
          <AvatarFallback>BF</AvatarFallback>
        </Avatar>
      </Link>
    );
}
