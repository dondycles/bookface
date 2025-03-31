import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/lib/components/ui/dialog";
import { errorHandlerWithToast, successHandlerWithToast } from "@/lib/utils";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { addPost, editPost, Post, postSchema } from "../server/fn/posts";
import FieldInfo from "./field-info";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

export default function UpsertPostDialog({
  children,
  post,
}: {
  children: React.ReactNode;
  post?: Post;
}) {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const route = useRouter();
  const form = useForm({
    defaultValues: {
      message: post ? post.message : "",
    },
    validators: { onChange: postSchema },
    onSubmit: async ({ value: { message } }) =>
      post
        ? handleEditPost.mutate({ newMessage: message, lastPost: post })
        : handleSubmitPost.mutate(message),
  });

  const handleSubmitPost = useMutation({
    mutationFn: async (message: string) => {
      return await addPost({ data: { message } });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
      form.reset();

      successHandlerWithToast("info", "Post added", {
        label: "View",
        onClick: () => {
          route.navigate({
            to: "/feed/$id",
            params: { id: res.id },
          });
        },
      });

      setOpenDialog(false);
    },
    onError: (e: Error) => errorHandlerWithToast(e),
  });

  const handleEditPost = useMutation({
    mutationFn: async (data: {
      lastPost: Post;
      newMessage: z.infer<typeof postSchema>["message"];
    }) => editPost({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["post", post?.id],
      });
      successHandlerWithToast("info", "Post edited");
      setOpenDialog(false);
    },
    onError: (e: Error) => errorHandlerWithToast(e),
  });

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{post ? "Edit" : "New"} Post</DialogTitle>
          <DialogDescription hidden={Boolean(post)}>
            Tell 'em what's new.
          </DialogDescription>
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
                {isSubmitting ? "Posting..." : "Post"}
              </Button>
            )}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
