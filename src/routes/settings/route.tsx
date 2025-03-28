import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4 py-24 sm:max-w-[512px] mx-auto">
      Hello "/settings"!
    </div>
  );
}
