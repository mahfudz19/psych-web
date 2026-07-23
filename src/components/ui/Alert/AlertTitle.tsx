'use client'

import type React from 'react'
import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

const AlertTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={twMerge('text-sm font-bold leading-tight', className)} {...props} />
  )
)
AlertTitle.displayName = 'AlertTitle'

export default AlertTitle
