import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  ScriptOnce,
  Scripts,
} from "@tanstack/react-router";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import Nav from "@/lib/components/nav";
import { currentUserQueryOptions } from "@/lib/queries/user";
import { CurrentUser } from "@/lib/server/fn/user";
import appCss from "@/lib/styles/app.css?url";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  currentUser: CurrentUser;
}>()({
  beforeLoad: async ({ context }) => {
    const currentUser = await context.queryClient.fetchQuery(currentUserQueryOptions()); // we're using react-query for caching, see router.tsx
    return { currentUser };
  },
  loader: ({ context: { currentUser } }) => {
    return { currentUser };
  },

  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "bookface",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { readonly children: React.ReactNode }) {
  const { currentUser } = Route.useLoaderData();
  return (
    // suppress since we're updating the "dark" class in a custom script below
    <html suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ScriptOnce>
          {`document.documentElement.classList.toggle(
            'dark',
            localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
            )`}
        </ScriptOnce>
        <Nav currentUser={currentUser} />

        {children}
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <TanStackRouterDevtools position="bottom-right" />

        <Scripts />
      </body>
    </html>
  );
}
