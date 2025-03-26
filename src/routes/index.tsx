import authClient from "@/lib/auth-client";
import ThemeToggle from "@/lib/components/ThemeToggle";
import { Button } from "@/lib/components/ui/button";
import { Link, Outlet, createFileRoute, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
  loader: ({ context }) => {
    return { currentUser: context.currentUser };
  },
});

function Home() {
  const { queryClient } = Route.useRouteContext();
  const { currentUser } = Route.useLoaderData();
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 p-6 h-screen">
      <div className="m-auto flex flex-col gap-4 items-center">
        <h1 className="text-6xl font-bold">bookface</h1>
        <p className="text-center text-muted-foreground">See the books behind faces.</p>
        {currentUser ? (
          <>
            <p className="mt-4">Welcome back, {currentUser.name}!</p>
            <Button type="button" asChild className="w-full">
              <Link to="/feed">Go to Feed</Link>
            </Button>
            <div className="flex gap-4 w-full">
              <Button
                onClick={async () => {
                  await authClient.signOut();
                  await queryClient.invalidateQueries({ queryKey: ["user"] });
                  await router.invalidate();
                }}
                type="button"
                className="flex-1"
                variant="destructive"
              >
                Sign out
              </Button>
              <ThemeToggle />
            </div>
          </>
        ) : (
          <div className="flex gap-4 mt-4 w-full">
            <Button
              onClick={() =>
                authClient.signIn.social({
                  provider: "google",
                  callbackURL: "/feed",
                })
              }
              type="button"
              className="flex-1"
            >
              Sign in
            </Button>
            <ThemeToggle />
          </div>
        )}
        <Outlet />
      </div>
    </div>
  );
}
