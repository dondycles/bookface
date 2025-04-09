import { queryOptions } from "@tanstack/react-query";
import { getCurrentUserTenNotifications } from "../server/fn/notification";

export const currentUserTenNotificationsQueryOptions = () =>
  queryOptions({
    queryKey: ["currentUserTenNotifications"],
    queryFn: ({ signal }) => getCurrentUserTenNotifications({ signal }),
  });
