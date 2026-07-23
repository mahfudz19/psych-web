import type React from 'react'
import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

type AlertDescriptionOwnProps = {}

type PolymorphicProps<Props, DefaultComponent extends React.ElementType> = {
  <C extends React.ElementType = DefaultComponent>(
    props: Props & { component?: C } & Omit<React.ComponentPropsWithoutRef<C>, keyof Props | 'component'>
  ): React.ReactElement | null
  displayName?: string
}

type AlertDescriptionComponent = PolymorphicProps<AlertDescriptionOwnProps, 'div'>

// Implementasi dengan tipe yang sangat longgar untuk menghindari error TypeScript
const AlertDescription = forwardRef(function AlertDescription(
  { component: Component = 'div', ...props }: any,
  ref: any
) {
  return (
    <Component
      ref={ref}
      {...props}
      className={twMerge('text-sm [&_p]:leading-relaxed', props.className)}
    />
  )
}) as AlertDescriptionComponent

AlertDescription.displayName = 'AlertDescription'

export default AlertDescription
