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
import { toast } from "sonner";
import { z } from "zod";
import { Comment, commentSchema, editComment } from "../server/fn/comments";
import FieldInfo from "./field-info";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

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
      toast.success("Comment edited");
      setOpenDialog(false);
    },
    onError: (e: Error) => {
      toast.error(JSON.parse(e.message)[0].message as string);
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
