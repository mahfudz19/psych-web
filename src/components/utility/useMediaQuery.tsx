'use client'
import { useLayoutEffect, useState } from 'react'

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const breakpoints: Record<Breakpoint, string> = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)'
}

const checkWindow = (breakpoint: Breakpoint) => {
  if (typeof window === 'undefined') {
    return false
  }

  return window?.matchMedia?.(breakpoints[breakpoint])?.matches
}

const useMediaQuery = (breakpoint: Breakpoint): boolean => {
  const mediaQuery = checkWindow(breakpoint)
  const [matches, setMatches] = useState(mediaQuery)

  const handleChange = (e: MediaQueryListEvent) => setMatches(e.matches)

  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia(breakpoints[breakpoint])
    setMatches(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [breakpoint])

  return matches
}

export default useMediaQuery
