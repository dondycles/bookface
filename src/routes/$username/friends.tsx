import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$username/friends')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$username/friends"!</div>
}
