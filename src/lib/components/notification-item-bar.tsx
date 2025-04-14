import { ComponentProps } from "react";
import { Notification } from "../server/fn/notification";
import { cn, getPhrase } from "../utils";
import TimeInfo from "./time-info";
import UserAvatar from "./user/user-avatar";

export default function NotificationItemBar({
  n,
  isPending,
  className,
  onClick,
  ...props
}: ComponentProps<"div"> & {
  n: Notification[0];
  isPending: boolean;
}) {
  return (
    <div
      onClick={onClick}
      key={n.id}
      className={cn(
        `${!n.isRead && "bg-accent/50"} ${isPending && "animate-pulse"} p-2 items-start cursor-pointer`,
        className,
      )}
      {...props}
    >
      <UserAvatar
        linkable={false}
        username={n.notifierData.username}
        url={n.notifierData.image}
        className="size-10"
      />
      <div>
        <p
          className={`${n.isRead === false ? "text-foreground" : "text-muted-foreground"} `}
        >
          {getPhrase({
            type: n.type,
            username: n.notifierData.username ?? n.notifierData.name,
            commentMessage: n.commentMessage,
          })}
        </p>
        <TimeInfo createdAt={n.createdAt} />
      </div>
    </div>
  );
}
