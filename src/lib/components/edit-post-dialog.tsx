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
import { editPost, Post } from "../server/fn/posts";
import FieldInfo from "./field-info";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

export const editPostSchema = z.object({
  newMessage: z
    .string()
    .min(1, "Post cannot be empty.")
    .max(512, "Max of 512 characters only."),
});

export default function EditPostDialog({
  children,
  post,
}: {
  children: React.ReactNode;
  post: Post;
}) {
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      newMessage: post.message,
    },
    validators: { onChange: editPostSchema },
    onSubmit: ({ value }) => handleEditPost.mutate({ ...value, lastPost: post }),
  });
  const [openDialog, setOpenDialog] = useState(false);

  const handleEditPost = useMutation({
    mutationFn: async (data: {
      lastPost: Post;
      newMessage: z.infer<typeof editPostSchema>["newMessage"];
    }) => editPost({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["post", post.id],
      });
      setOpenDialog(false);
    },
  });

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
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
            className={`${handleEditPost.isPending && "animate-pulse cursor-progress"}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            Edit Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
