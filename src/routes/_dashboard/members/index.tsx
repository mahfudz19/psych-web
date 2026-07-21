import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/members/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/members/indet"!</div>
}
