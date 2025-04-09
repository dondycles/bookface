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
import { Check, ChevronDown, Globe2, Lock } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { addPost, editPost, Post, postSchema } from "../../server/fn/posts";
import FieldInfo from "../field-info";
import { Button } from "../ui/button";
import { Command, CommandGroup, CommandItem, CommandList } from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Textarea } from "../ui/textarea";

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
      privacy: post?.privacy ?? "public",
    },
    validators: { onChange: postSchema },
    onSubmit: async ({ value: newPost }) =>
      post
        ? handleEditPost.mutate({ newPost, lastPost: post })
        : handleSubmitPost.mutate(newPost),
  });

  const handleSubmitPost = useMutation({
    mutationFn: async ({
      message,
      privacy,
    }: {
      message: string;
      privacy: z.infer<typeof postSchema.shape.privacy>;
    }) => {
      return await addPost({ data: { message, privacy } });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
      queryClient.invalidateQueries({
        queryKey: ["currentUserPosts"],
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
    mutationFn: async (data: { lastPost: Post; newPost: z.infer<typeof postSchema> }) =>
      editPost({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["post", post?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["currentUserPosts"],
      });
      successHandlerWithToast("info", "Post edited");
      setOpenDialog(false);
    },
    onError: (e: Error) => errorHandlerWithToast(e),
  });

  const pending = handleEditPost.isPending || handleSubmitPost.isPending;

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{post ? "Edit" : "New"} Post</DialogTitle>
          <DialogDescription hidden={Boolean(post)}>
            Tell 'em what's new. {form.getFieldValue("privacy")}
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
                disabled={pending}
              />
              <em className="text-muted-foreground text-xs">
                {field.state.value.length}/512
              </em>
              <FieldInfo field={field} />
            </>
          )}
        />
        <DialogFooter className="flex flex-row justify-end">
          <form.Field
            name="privacy"
            children={(field) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" disabled={pending}>
                    {(field.state.value === "public" && <Globe2 />) ||
                      (field.state.value === "private" && <Lock />)}
                    <ChevronDown className="text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  onBlur={field.handleBlur}
                  className="w-fit p-0"
                  align="end"
                >
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        <CommandItem
                          onSelect={(v) => {
                            field.handleChange(v as "public");
                          }}
                          value="public"
                        >
                          <CheckMarker matcher="public" value={field.state.value} />
                          <Globe2 /> Public
                        </CommandItem>
                        <CommandItem
                          onSelect={(v) => {
                            field.handleChange(v as "private");
                          }}
                          value="private"
                        >
                          <CheckMarker matcher="private" value={field.state.value} />
                          <Lock /> Private
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          />
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            disabled={pending}
            className={`${pending && "animate-pulse cursor-progress"}`}
          >
            {pending ? "Posting..." : "Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CheckMarker({ value, matcher }: { value: string; matcher: string }) {
  return <Check className={`${value === matcher ? "opacity-100" : "opacity-0"}`} />;
}
