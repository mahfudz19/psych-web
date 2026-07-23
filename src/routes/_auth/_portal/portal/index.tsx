import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/_portal/portal/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_portal/portal/"!</div>
}
