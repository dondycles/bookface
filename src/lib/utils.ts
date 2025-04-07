import { type ClassValue, clsx } from "clsx";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import { Friendships } from "./server/fn/friendships";
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
