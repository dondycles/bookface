import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { z } from "zod";
import { addComment, commentSchema } from "../server/fn/comments";
import FieldInfo from "./field-info";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

export default function AddCommentForm({
  postId,
  children,
}: {
  postId: string;
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const form = useForm({
    validators: { onChange: commentSchema },
    defaultValues: {
      message: "",
    },
    onSubmit: ({ value }) => handleAddCommentToPost.mutate(value),
  });

  const handleAddCommentToPost = useMutation({
    mutationFn: async (data: { message: z.infer<typeof commentSchema>["message"] }) =>
      await addComment({ data: { ...data, postId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", postId],
      });
      form.reset();
    },
  });
  return (
    <form
      className={`flex-1 flex gap-2 ${handleAddCommentToPost.isPaused && "animate-pulse"}`}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="message"
        children={(field) => (
          <div className="flex-1 flex gap-2 flex-col">
            <div className="flex-1 flex gap-2 items-end">
              <Textarea
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Give some of your thoughts"
              />
              <div className="flex flex-col gap-2 justify-end items-end">
                <Button type="submit" variant={"secondary"} size={"icon"}>
                  <Send />
                </Button>
                {children}
                <em className="text-muted-foreground text-xs">
                  {field.state.value.length}/512
                </em>
              </div>
            </div>
            <FieldInfo field={field} />
          </div>
        )}
      />
    </form>
  );
}
