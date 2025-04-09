import FieldInfo from "@/lib/components/field-info";
import { Button } from "@/lib/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/lib/components/ui/dialog";
import { Textarea } from "@/lib/components/ui/textarea";
import { Comment, commentSchema, editComment } from "@/lib/server/fn/comments";
import { errorHandlerWithToast, successHandlerWithToast } from "@/lib/utils";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";

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
      message: comment.message,
    },
    validators: { onChange: commentSchema },
    onSubmit: ({ value }) =>
      handleEditComment.mutate({ newMessage: value.message, lastComment: comment }),
  });
  const [openDialog, setOpenDialog] = useState(false);

  const handleEditComment = useMutation({
    mutationFn: async (data: {
      lastComment: Comment;
      newMessage: z.infer<typeof commentSchema>["message"];
    }) => editComment({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comment", comment.id],
      });
      successHandlerWithToast("success", "Comment edited");
      setOpenDialog(false);
    },
    onError: (e: Error) => errorHandlerWithToast(e),
  });

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Comment</DialogTitle>
        </DialogHeader>
        <form.Field
          name="message"
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
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
                disabled={!canSubmit}
                className={`${isSubmitting && "animate-pulse cursor-progress"}`}
              >
                {isSubmitting ? "Editing..." : " Edit Comment"}
              </Button>
            )}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
