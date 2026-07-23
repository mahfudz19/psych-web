'use client'

import React from 'react'

export interface ToastOptions {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  toastOptions?: { duration?: number }
}

export const Toaster: React.FC<ToastOptions> = () => null
