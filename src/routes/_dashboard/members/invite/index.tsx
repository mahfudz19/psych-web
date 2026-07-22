import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/members/invite/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/members/invite/"!</div>
}
