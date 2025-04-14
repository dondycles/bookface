import { useMutation } from "@tanstack/react-query";
import { readNotification } from "../server/fn/notification";
import { errorHandlerWithToast } from "../utils";

export const useHandleReadNotifications = ({
  refetch,
  ids,
}: {
  refetch: () => void;
  ids: [string];
}) => {
  return useMutation({
    mutationFn: async () => await readNotification({ data: { ids } }),
    onSuccess: () => {
      refetch();
    },
    onError: (e: Error) => {
      errorHandlerWithToast(e);
    },
  });
};
