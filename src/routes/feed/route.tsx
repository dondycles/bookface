import { Link, Outlet, createFileRoute, useRouter } from "@tanstack/react-router";
import { LogIn, LogOut } from "lucide-react";
import authClient from "~/lib/auth-client";
import { Button } from "~/lib/components/ui/button";

export const Route = createFileRoute("/feed")({
  component: FeedLayout,
  // beforeLoad: async ({ context }) => {
  //   if (!context.user) {
  //     throw redirect({ to: "/" });
  //   }

  // `context.queryClient` is also available in our loaders
  // https://tanstack.com/start/latest/docs/framework/react/examples/start-basic-react-query
  // https://tanstack.com/router/latest/docs/framework/react/guide/external-data-loading
  // },
  loader: ({ context }) => {
    return { user: context.user };
  },
});

function FeedLayout() {
  const { queryClient } = Route.useRouteContext();
  const { user } = Route.useLoaderData();
  const router = useRouter();
  return (
    <div className="flex flex-col gap-4 p-4 h-[100dvh]">
      <div className="gap-4 flex justify-between ">
        <Link to={"/feed"} className="text-4xl font-bold">
          bookface
        </Link>
        {user ? (
          <Button
            onClick={async () => {
              await authClient.signOut();
              await queryClient.invalidateQueries({ queryKey: ["user"] });
              await router.invalidate();
            }}
            variant={"destructive"}
            size={"icon"}
          >
            <LogOut />
          </Button>
        ) : (
          <Button
            onClick={() =>
              authClient.signIn.social({
                provider: "google",
                callbackURL: "/feed",
              })
            }
            size={"icon"}
          >
            <LogIn />
          </Button>
        )}
      </div>
      <Outlet />
    </div>
  );
}
