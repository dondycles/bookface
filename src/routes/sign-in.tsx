import authClient from "@/lib/auth-client";
import { Button } from "@/lib/components/ui/button";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { LogIn } from "lucide-react";

export const Route = createFileRoute("/sign-in")({
  component: RouteComponent,
  loader: ({ context }) => {
    if (context.currentUserInfo)
      throw redirect({
        to: "/",
      });
  },
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4 py-24 sm:max-w-[512px] mx-auto">
      <p className="font-bold text-4xl">bookface</p>
      <p>See the books behind faces.</p>
      <Button
        onClick={() =>
          authClient.signIn.social({
            provider: "google",
            callbackURL: "/feed",
          })
        }
      >
        <LogIn />
        Login to explore
      </Button>
    </div>
  );
}
