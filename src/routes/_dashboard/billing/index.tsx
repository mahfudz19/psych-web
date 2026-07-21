import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/billing/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/billing/"!</div>
}
