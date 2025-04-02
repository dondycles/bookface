import { errorHandlerWithToast, successHandlerWithToast } from "@/lib/utils";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { currentUserInfoQueryOptions } from "../queries/user";
import { CurrentUserInfo, updateUsername, usernameSchema } from "../server/fn/user";
import FieldInfo from "./field-info";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";

export default function SetUsernameDialog({
  currentUserInfo: currentUserInfoInitialData,
}: {
  currentUserInfo: CurrentUserInfo;
}) {
  const queryClient = useQueryClient();
  const { data: currentUserInfo } = useSuspenseQuery({
    ...currentUserInfoQueryOptions(),
    initialData: currentUserInfoInitialData,
  });
  const [openDialog, setOpenDialog] = useState(
    Boolean(currentUserInfo && !currentUserInfo.dB?.username),
  );

  const form = useForm({
    defaultValues: {
      username: "",
    },
    validators: { onChange: usernameSchema },
    onSubmit: async ({ value: { username } }) => handleSetUsername.mutate(username),
  });

  const handleSetUsername = useMutation({
    mutationFn: async (username: string) => updateUsername({ data: { username } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["currentUserInfo"],
      });
      form.reset();
      successHandlerWithToast("success", "Username set");
      setOpenDialog(false);
    },
    onError: (e: Error) => errorHandlerWithToast(e),
  });

  return (
    <Dialog open={openDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Hello, {currentUserInfo?.dB?.name}</DialogTitle>
          <DialogDescription>Please input your desired username</DialogDescription>
        </DialogHeader>
        <form.Field
          name="username"
          children={(field) => (
            <>
              <Input
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="max-h-[35dvh] scrollbar scrollbar-thumb-muted"
              />
              <em className="text-muted-foreground text-xs">
                {field.state.value.length}/32
              </em>
              <FieldInfo field={field} />
            </>
          )}
        />

        <DialogFooter>
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            Set Username
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
