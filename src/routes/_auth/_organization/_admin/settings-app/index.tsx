import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_auth/_organization/_admin/settings-app/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/_organization/_admin/settings-app/"!</div>
}
