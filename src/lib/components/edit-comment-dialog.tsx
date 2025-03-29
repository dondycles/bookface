import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/lib/components/ui/dialog";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { Comment, editComment } from "../server/fn/comments";
import FieldInfo from "./field-info";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

export const editCommentSchema = z.object({
  newMessage: z
    .string()
    .min(1, "Comment cannot be empty.")
    .max(512, "Max of 512 characters only."),
});
export default function EditCommentDialog({
  children,
  comment,
}: {
  children: React.ReactNode;
  comment: Comment;
}) {
  const queryClient = useQueryClient();
  const form = useForm({
    defaultValues: {
      newMessage: comment.message,
    },
    validators: { onChange: editCommentSchema },
    onSubmit: ({ value }) => handleEditComment.mutate({ ...value, lastComment: comment }),
  });
  const [openDialog, setOpenDialog] = useState(false);

  const handleEditComment = useMutation({
    mutationFn: async (data: {
      lastComment: Comment;
      newMessage: z.infer<typeof editCommentSchema>["newMessage"];
    }) => editComment({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comment", comment.id],
      });
      setOpenDialog(false);
    },
  });

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Comment</DialogTitle>
          {/* <DialogDescription>Tell 'em what's new.</DialogDescription> */}
        </DialogHeader>
        <form.Field
          name="newMessage"
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
                {field.state.value.length}/512
              </em>
              <FieldInfo field={field} />
            </>
          )}
        />
        <DialogFooter>
          <Button
            className={`${handleEditComment.isPending && "animate-pulse cursor-progress"}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            Edit Comment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
