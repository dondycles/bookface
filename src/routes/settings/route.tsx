import FieldInfo from "@/lib/components/field-info";
import { Button } from "@/lib/components/ui/button";
import { Input } from "@/lib/components/ui/input";
import { Label } from "@/lib/components/ui/label";
import { Textarea } from "@/lib/components/ui/textarea";
import UserAvatar from "@/lib/components/user/user-avatar";
import { currentUserInfoQueryOptions } from "@/lib/queries/user";
import { editProfile, settingsSchema } from "@/lib/server/fn/user";
import { errorHandlerWithToast, successHandlerWithToast } from "@/lib/utils";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/settings")({
  component: RouteComponent,
  loader: ({ context }) => {
    if (!context.currentUserInfo)
      throw redirect({
        to: "/",
      });
  },
});

function RouteComponent() {
  const { currentUserInfo: currentUserInfoInitialData } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const { data: currentUserInfo } = useQuery({
    ...currentUserInfoQueryOptions(),
    initialData: currentUserInfoInitialData,
  });

  const form = useForm({
    defaultValues: {
      name: currentUserInfo?.dB.name ?? "",
      username: currentUserInfo?.dB.username ?? "",
      bio: currentUserInfo?.dB.bio ?? "",
    },
    validators: { onChange: settingsSchema },
    onSubmit: async ({ value }) => submitPost.mutate(value),
  });

  const submitPost = useMutation({
    mutationFn: async (data: z.infer<typeof settingsSchema>) => editProfile({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["currentUserPosts"],
      });
      successHandlerWithToast("success", "Profile updated");
    },
    onError: (e: Error) => errorHandlerWithToast(e),
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
        username={currentUserInfo?.dB.username}
        url={currentUserInfo?.dB.image}
        className="size-32 mx-auto"
      />
      <form.Field
        name="name"
        children={(field) => (
          <div className="flex flex-col gap-2 flex-1">
            <Label htmlFor={field.name}>Name</Label>
            <Input
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="max-h-[35dvh] scrollbar scrollbar-thumb-muted"
            />
            <div className="flex gap-2 items-baseline">
              <div className="flex-1">
                <FieldInfo field={field} />
              </div>
              <em className="text-muted-foreground text-xs text-right">
                {field.state.value.length}/72
              </em>
            </div>
          </div>
        )}
      />

      <form.Field
        name="username"
        children={(field) => (
          <div className="flex flex-col gap-2 flex-1">
            <Label htmlFor={field.name}>Username</Label>
            <Input
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="max-h-[35dvh] scrollbar scrollbar-thumb-muted"
            />
            <div className="flex gap-2 items-baseline">
              <div className="flex-1">
                <FieldInfo field={field} />
              </div>
              <em className="text-muted-foreground text-xs text-right">
                {field.state.value.length}/32
              </em>
            </div>
          </div>
        )}
      />

      <form.Field
        name="bio"
        children={(field) => (
          <div className="flex-1 flex flex-col gap-2">
            <Label htmlFor={field.name}>Bio</Label>
            <Textarea
              placeholder="Tell us about yourself"
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="max-h-[35dvh] scrollbar scrollbar-thumb-muted"
            />
            <div className="flex gap-2 items-baseline">
              <div className="flex-1">
                <FieldInfo field={field} />
              </div>
              <em className="text-muted-foreground text-xs text-right">
                {field.state.value.length}/512
              </em>
            </div>
          </div>
        )}
      />
      <Button type="submit">Update</Button>
      <Button variant={"destructive"}>Delete Account</Button>
    </form>
  );
}
