import { useMutation } from "@tanstack/react-query";
import { readNotification } from "../server/fn/notification";

export const useReadNotificationsMutation = ({
  ids,
  refetch,
}: {
  ids: [string];
  refetch: () => void;
}) => {
  return useMutation({
    mutationFn: async () => {
      return await readNotification({
        data: { ids },
      });
    },
    onSuccess: () => {
      refetch();
    },
    onError: () => {
      refetch();
    },
  });
};
