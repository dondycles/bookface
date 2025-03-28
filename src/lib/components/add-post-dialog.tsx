import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/lib/components/ui/dialog";
import { AnyFieldApi, useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { addPost } from "../server/fn/posts";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

const postSchema = z.object({
  message: z
    .string()
    .min(1, "Post cannot be empty.")
    .max(512, "Max of 256 characters only."),
});

function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <em>{field.state.meta.errors[0].message}</em>
      ) : null}
    </>
  );
}

export default function AddPostDialog({ children }: { children: React.ReactNode }) {
  const { queryClient } = useRouteContext({ from: "__root__" });
  const [openDialog, setOpenDialog] = useState(false);
  // const [message, setMessage] = useState("");

  const form = useForm({
    defaultValues: {
      message: "",
    },
    validators: { onChange: postSchema },
    onSubmit: async ({ value: { message } }) => submitPost.mutate(message),
  });

  const submitPost = useMutation({
    mutationFn: async (message: string) => addPost({ data: { message } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
      form.reset();
      setOpenDialog(false);
      // setMessage("");
    },
  });

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Post</DialogTitle>
          <DialogDescription>Tell 'em what's new.</DialogDescription>
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
