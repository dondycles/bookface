import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { UserInfo } from "../server/fn/user";
import UserAvatar from "./user-avatar";

export default function UserBar({ u }: { u: UserInfo }) {
  if (u)
    return (
      <div
        key={u.id}
        className="sm:rounded-md bg-muted py-4 px-2 sm:px-4 flex gap-2 justify-between"
      >
        <div className="flex gap-2 items-center">
          <Link
            to="/$username/posts"
            params={{ username: u.username! }}
            search={{ flow: "desc", postsOrderBy: "recent" }}
          >
            <UserAvatar className="size-14" alt={u.username ?? u.email} url={u.image} />
          </Link>
          <div>
            <Link
              to="/$username/posts"
              params={{ username: u.username! }}
              search={{ flow: "desc", postsOrderBy: "recent" }}
              className="font-semibold text-lg"
            >
              <p>{u.name}</p>
            </Link>
            <Link
              to="/$username/posts"
              params={{ username: u.username! }}
              search={{ flow: "desc", postsOrderBy: "recent" }}
              className="text-muted-foreground text-sm"
            >
              <p>@{u.username}</p>
            </Link>
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
