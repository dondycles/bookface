import FieldInfo from "@/lib/components/field-info";
import { Button } from "@/lib/components/ui/button";
import { Input } from "@/lib/components/ui/input";
import { currentUserQueryOptions } from "@/lib/queries/user";
import { editProfile } from "@/lib/server/fn/user";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

export const settingsSchema = z.object({
  name: z.string().min(1, "Name cannot be empty.").max(72, "Max of 256 characters only."),
  username: z
    .string()
    .min(1, "Username cannot be empty.")
    .max(32, "Max of 32 characters only."),
});

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
      className="flex flex-col gap-4 py-24 sm:max-w-[512px] mx-auto"
    >
      <div className="flex gap-2 items-center">
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
      <div className="flex gap-2 items-center">
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
