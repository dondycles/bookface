import { Button } from "@/lib/components/ui/button";
import { createFileRoute, redirect } from "@tanstack/react-router";

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
  return (
    <div className="flex flex-col gap-4 py-24 sm:max-w-[512px] mx-auto">
      <Button></Button>
    </div>
  );
}
