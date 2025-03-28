import {
  type ErrorComponentProps,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
} from "@tanstack/react-router";
import { Button } from "./ui/button";

export function DefaultCatchBoundary({ error }: Readonly<ErrorComponentProps>) {
  const router = useRouter();
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  });

  return (
    <div className="py-24 px-2 sm:px-4 space-y-4">
      <p className="italic text-sm text-muted-foreground text-center">
        {error.name}: {error.message}
      </p>
      <div className="flex gap-4 justify-center">
        <Button
          type="button"
          onClick={() => {
            router.invalidate();
          }}
        >
          Try Again
        </Button>

        {isRoot ? (
          <Button asChild variant="secondary">
            <Link to="/">Home</Link>
          </Button>
        ) : (
          <Button asChild variant="secondary">
            <Link
              to="/"
              onClick={(e) => {
                e.preventDefault();
                window.history.back();
              }}
            >
              Go Back
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
