import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/lib/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { CurrentUser, editBio } from "../server/fn/user";
import FieldInfo from "./field-info";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

export const bioSchema = z.object({
  bio: z.string().max(72, "Max of 72 characters only."),
});

export default function EditBioDialog({
  children,
  currentUser,
}: {
  children: React.ReactNode;
  currentUser: CurrentUser;
}) {
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: { bio: currentUser?.dB.bio ?? "" },
    validators: { onChange: bioSchema },
    onSubmit: async ({ value }) => handleEditBio.mutate(value),
  });

  const [openDialog, setOpenDialog] = useState(false);

  const handleEditBio = useMutation({
    mutationFn: async (bio: z.infer<typeof bioSchema>) => editBio({ data: bio }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["currentUser"],
      });

      setOpenDialog(false);
    },
  });

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Bio</DialogTitle>
          <DialogDescription>Your favorite moto or somethin'.</DialogDescription>
        </DialogHeader>
        <form.Field
          name="bio"
          children={(field) => (
            <>
              <Textarea
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="max-h-[35dvh] scrollbar scrollbar-thumb-muted"
              />
              <em className="text-muted-foreground text-xs">
                {field.state.value.length}/72
              </em>
              <FieldInfo field={field} />
            </>
          )}
        />
        <DialogFooter>
          <Button
            className={`${handleEditBio.isPending && "animate-pulse cursor-progress"}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            Edit Bio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
