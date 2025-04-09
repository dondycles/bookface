import { queryOptions } from "@tanstack/react-query";
import { getCurrentUserNotifications } from "../server/fn/notification";

export const currentUserNotificationsQueryOptions = () =>
  queryOptions({
    queryKey: ["currentUserNotifications"],
    queryFn: ({ signal }) => getCurrentUserNotifications({ signal }),
  });
