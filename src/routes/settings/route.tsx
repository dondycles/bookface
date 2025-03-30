import UserAvatar from "@/lib/components/avatar";
import FieldInfo from "@/lib/components/field-info";
import { Button } from "@/lib/components/ui/button";
import { Input } from "@/lib/components/ui/input";
import { Textarea } from "@/lib/components/ui/textarea";
import { currentUserQueryOptions } from "@/lib/queries/user";
import { editProfile, settingsSchema } from "@/lib/server/fn/user";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/settings")({
  component: RouteComponent,
  loader: ({ context }) => {
    if (!context.currentUser)
      throw redirect({
        to: "/",
      });
  },
});

function RouteComponent() {
  const { currentUser: currentUserData } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const { data: currentUser } = useSuspenseQuery({
    ...currentUserQueryOptions(),
    initialData: currentUserData,
  });

  const form = useForm({
    defaultValues: {
      name: currentUser?.dB.name ?? "",
      username: currentUser?.dB.username ?? "",
      bio: currentUser?.dB.bio ?? "",
    },
    validators: { onChange: settingsSchema, onSubmit: settingsSchema },
    onSubmit: async ({ value }) => submitPost.mutate(value),
  });

  const submitPost = useMutation({
    mutationFn: async (data: z.infer<typeof settingsSchema>) => editProfile({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["currentUser"],
      });
    },
    onError: () => {
      form.reset();
    },
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4 py-24 sm:max-w-[512px] mx-auto px-2 sm:px-0"
    >
      <UserAvatar
        alt={currentUser?.dB.username ?? "User PFP"}
        url={currentUser?.dB.image}
        className="size-32 mx-auto"
      />
      <div className="flex gap-2  items-start">
        <p>Name: </p>
        <form.Field
          name="name"
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
                {field.state.value.length}/72
              </em>
              <FieldInfo field={field} />
            </>
          )}
        />
      </div>
      <div className="flex gap-2  items-start">
        <p>Username: </p>
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
      </div>
      <div className="flex gap-2 items-start">
        <p>Bio: </p>
        <form.Field
          name="bio"
          children={(field) => (
            <>
              <Textarea
                placeholder="Tell us about yourself"
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
      </div>
      <Button type="submit">Update</Button>
      <Button variant={"destructive"}>Delete Account</Button>
    </form>
  );
}
