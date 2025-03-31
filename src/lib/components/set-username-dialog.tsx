import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { currentUserQueryOptions } from "../queries/user";
import { CurrentUser, updateUsername } from "../server/fn/user";
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

export const usernameSchema = z.object({
  username: z
    .string()
    .min(1, "Username cannot be empty.")
    .max(32, "Max of 32 characters only."),
});

export default function SetUsernameDialog({
  currentUser: currentUserData,
}: {
  currentUser: CurrentUser;
}) {
  const queryClient = useQueryClient();
  const { data: currentUser } = useSuspenseQuery({
    ...currentUserQueryOptions(),
    initialData: currentUserData,
  });
  const [openDialog, setOpenDialog] = useState(
    Boolean(currentUser && !currentUser.dB?.username),
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
        queryKey: ["currentUser"],
      });
      form.reset();
      toast.success("Username set");
      setOpenDialog(false);
    },
    onError: (e: Error) => {
      toast.error(JSON.parse(e.message)[0].message as string);
    },
  });

  return (
    <Dialog open={openDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Hello, {currentUser?.dB?.name}</DialogTitle>
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
