import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { getCurrentUserNotifications } from "../server/fn/notification";
import { CurrentUserInfo } from "../server/fn/user";

export const currentUserTenNotificationsQueryOptions = () =>
  queryOptions({
    queryKey: ["currentUserTenNotifications"],
    queryFn: ({ signal }) =>
      getCurrentUserNotifications({ signal, data: { pageParam: 0 } }),
  });

export const currentUserNotificationsQueryOptions = (currentUserInfo: CurrentUserInfo) =>
  infiniteQueryOptions({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["currentUserNotifications", currentUserInfo?.dB.id],
    queryFn: ({ signal, pageParam }) =>
      getCurrentUserNotifications({ signal, data: { pageParam } }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.length === 0) {
        return undefined;
      }
      return lastPageParam + 1;
    },
  });
