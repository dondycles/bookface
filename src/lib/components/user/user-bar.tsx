import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { UserInfo } from "../../server/fn/user";
import UserAvatar from "./user-avatar";
import UserLink from "./user-link";

export default function UserBar({ u }: { u: UserInfo }) {
  if (u)
    return (
      <div
        key={u.id}
        className="sm:rounded-md bg-muted py-4 px-2 sm:px-4 flex gap-2 justify-between"
      >
        <div className="flex gap-2 items-center">
          <UserAvatar className="size-14" username={u.username} url={u.image} />
          <div>
            <UserLink
              className="font-semibold text-lg"
              username={u.username ?? ""}
              text={u.name}
            />
            <UserLink
              className="text-muted-foreground text-sm"
              username={u.username ?? ""}
              text={u.username ?? ""}
            />
            <p className="text-muted-foreground text-sm">
              Joined: {u.createdAt.toLocaleString()}
            </p>
          </div>
        </div>
        <Link
          to="/$username/posts"
          search={{ postsOrderBy: "recent", flow: "desc" }}
          params={{ username: u.username ?? "" }}
        >
          <ExternalLink className="text-muted-foreground size-5" />
        </Link>
      </div>
    );
}
