import authClient from "@/lib/auth-client";
import ThemeToggle from "@/lib/components/ThemeToggle";
import { Button } from "@/lib/components/ui/button";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
  loader: ({ context }) => {
    if (context.currentUser) throw redirect({ to: "/feed" });
    return { currentUser: context.currentUser };
  },
});

function Home() {
  return (
    <div className="flex flex-col gap-4 p-6 h-screen">
      <div className="m-auto flex flex-col gap-4 items-center">
        <h1 className="text-6xl font-bold">bookface</h1>
        <p className="text-center text-muted-foreground">See the books behind faces.</p>

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
        <Outlet />
      </div>
    </div>
  );
}
