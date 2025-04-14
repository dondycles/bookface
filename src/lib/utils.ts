import { AnyRouter } from "@tanstack/react-router";
import { type ClassValue, clsx } from "clsx";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import { notification } from "./schema";
import { Friendships } from "./server/fn/friendships";
import { Notification } from "./server/fn/notification";
import { UserInfo } from "./server/fn/user";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const errorHandlerWithToast = (e: Error) => {
  if (e.name === "PostgresError") {
    toast.error(e.message);
  }
  if (e.name === "Error") {
    toast.error(JSON.parse(e.message)[0].message as string);
  }
};

export const successHandlerWithToast = (
  type: "success" | "info" | "warning",
  message: string,
  action?: {
    label: string;
    onClick: () => void;
  },
) => {
  if (action) {
    if (type === "success")
      toast.success(message, {
        action: {
          label: action.label,
          onClick: () => {
            action.onClick();
          },
        },
      });
    if (type === "info")
      toast.info(message, {
        action: {
          label: action.label,
          onClick: () => {
            action.onClick();
          },
        },
      });
    if (type === "warning")
      toast.warning(message, {
        action: {
          label: action.label,
          onClick: () => {
            action.onClick();
          },
        },
      });
    return;
  }
  if (type === "success") {
    toast.success(message);
  }
  if (type === "info") {
    toast.info(message);
  }
  if (type === "warning") {
    toast.warning(message);
  }
};

export const getModifiedFriendships = (friendships: Friendships, username: string) => {
  if (!friendships) return [];
  const modifiedFriendships: Array<
    Omit<
      NonNullable<(typeof friendships)[0]>,
      "receiverInfo" | "requesterInfo" | "requester" | "receiver"
    > & { info: UserInfo }
  > = [];
  friendships.map((f, i) => {
    modifiedFriendships[i] = {
      ...f,
      info: f.receiverInfo.username !== username ? f.receiverInfo : f.requesterInfo,
    };
  });
  return modifiedFriendships;
};

export const getPendingReceivedFriendships = (
  friendships: Friendships,
  username: string,
) => {
  return friendships.filter(
    (f) => f.requesterInfo.username !== username && f.status === "pending",
  );
};

export const getPhrase = ({
  username,
  type,
  commentMessage,
}: {
  username: string;
  type: typeof notification.$inferInsert.type;
  commentMessage?: string;
}) => {
  return `${username}
    ${type === "addfriendship" ? " sent you friendship request." : ""}
    ${type === "acceptedfriendship" ? " accepted you friendship request." : ""}
    ${
      type === "comment"
        ? ` commented "${commentMessage?.slice(0, 10)}..." on your post.`
        : ""
    }
    ${type === "like" ? " liked your post." : ""}`;
};

export const navigateToNotif = (n: Notification[0], router: AnyRouter) => {
  if (n.type === "acceptedfriendship" || n.type === "addfriendship") {
    router.navigate({
      to: "/$username/posts",
      params: { username: n.notifierData.username! },
      search: {
        flow: "desc",
        postsOrderBy: "recent",
      },
    });
  }
  if (n.type === "comment") {
    router.navigate({
      to: "/feed/$id",
      params: { id: n.commentPostId },
    });
  }
  if (n.type === "like") {
    router.navigate({
      to: "/feed/$id",
      params: { id: n.likePostId },
    });
  }
};
