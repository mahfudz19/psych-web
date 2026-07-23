'use client'

import React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import Alert from '../Alert'
import AlertTitle from '../Alert/AlertTitle'
import AlertDescription from '../Alert/AlertDescription'

export type ToastType = 'info' | 'success' | 'error' | 'warning'

const toastConfig = {
  position: 'fixed top-4 right-4',
  autoCloseDelay: 4000,
  maxToasts: 5,
  stackScale: 0.05,
  stackGap: 14,
  entryDelay: 180,
  titles: {
    success: 'Berhasil',
    error: 'Terjadi Kesalahan',
    warning: 'Peringatan',
    info: 'Informasi'
  }
}

type ToastInstance = {
  id: string
  el: HTMLDivElement
  duration: number
  type: ToastType
  message: string
  root: Root
  pause?: () => void
  resume?: () => void
}

type PendingToast = {
  id: string
  type: ToastType
  message: string
  duration: number
}

class ToastService {
  containerId = 'toast-container'
  toasts: ToastInstance[] = []
  isHovering = false
  queue: PendingToast[] = []
  isProcessingQueue = false

  handleMouseMove = (event: MouseEvent) => {
    if (!this.toasts.length) {
      if (this.isHovering) {
        this.isHovering = false
        this.resumeAll()
        this.updateStack()
      }
      return
    }

    let minLeft = Infinity
    let minTop = Infinity
    let maxRight = -Infinity
    let maxBottom = -Infinity

    this.toasts.forEach(t => {
      const rect = t.el.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      if (rect.left < minLeft) minLeft = rect.left
      if (rect.top < minTop) minTop = rect.top
      if (rect.right > maxRight) maxRight = rect.right
      if (rect.bottom > maxBottom) maxBottom = rect.bottom
    })

    if (minLeft === Infinity) return

    const inside =
      event.clientX >= minLeft && event.clientX <= maxRight && event.clientY >= minTop && event.clientY <= maxBottom

    if (inside && !this.isHovering) {
      this.isHovering = true
      this.pauseAll()
      this.updateStack()
    } else if (!inside && this.isHovering) {
      this.isHovering = false
      this.resumeAll()
      this.updateStack()
    }
  }

  getContainer(): HTMLDivElement | null {
    if (typeof window === 'undefined') return null
    let container = document.getElementById(this.containerId) as HTMLDivElement | null
    if (!container) {
      container = document.createElement('div')
      container.id = this.containerId
      container.className = `${toastConfig.position} z-[9999] w-[356px] max-w-[calc(100vw-2rem)] flex flex-col items-end pointer-events-none p-4 group perspective-1000`
      window.addEventListener('mousemove', this.handleMouseMove)
      document.body.appendChild(container)
    }
    return container
  }

  pauseAll() {
    this.toasts.forEach(t => t.pause && t.pause())
  }

  resumeAll() {
    this.toasts.forEach(t => t.resume && t.resume())
  }

  show(message: string, type: ToastType = 'info', duration = toastConfig.autoCloseDelay) {
    if (typeof window === 'undefined') return

    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const pending: PendingToast = { id, type, message, duration }

    this.queue.push(pending)
    this.processQueue()

    return id
  }

  processQueue() {
    if (typeof window === 'undefined') return
    if (this.isProcessingQueue) return
    if (this.toasts.length >= toastConfig.maxToasts) return

    const next = this.queue.shift()
    if (!next) return

    this.isProcessingQueue = true
    this.createToast(next)

    window.setTimeout(() => {
      this.isProcessingQueue = false
      this.processQueue()
    }, toastConfig.entryDelay)
  }

  createToast(pending: PendingToast) {
    if (typeof window === 'undefined') return

    const { id, message, type, duration } = pending

    const container = this.getContainer()
    if (!container) return

    const toastEl = document.createElement('div')
    toastEl.id = id
    toastEl.dataset.id = id

    const baseClasses = `absolute top-0 right-0 w-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] transform-origin-top opacity-0 -translate-y-8 scale-95`

    toastEl.className = baseClasses
    container.appendChild(toastEl)

    const root = createRoot(toastEl)

    const alertElement = React.createElement(
      Alert as any,
      {
        severity: type,
        variant: 'standard',
        className: 'shadow-[0_10px_40px_rgba(0,0,0,0.08)] pointer-events-auto',
        closable: true,
        onClose: () => this.close(id)
      },
      [
        React.createElement(AlertTitle as any, { key: 'title' }, toastConfig.titles[type]),
        React.createElement(AlertDescription as any, { key: 'description' }, message)
      ]
    )

    root.render(alertElement)

    const toastObj: ToastInstance = { id, el: toastEl, duration, type, message, root }
    this.toasts.push(toastObj)

    requestAnimationFrame(() => {
      toastEl.classList.remove('-translate-y-8', 'opacity-0', 'scale-95')
      this.updateStack()
    })

    if (duration > 0) {
      let remaining = duration
      let start = Date.now()
      let timerId: number | undefined

      const resume = () => {
        start = Date.now()
        timerId = window.setTimeout(() => this.close(id), remaining)
      }

      const pause = () => {
        if (timerId) window.clearTimeout(timerId)
        remaining -= Date.now() - start
      }

      toastObj.pause = pause
      toastObj.resume = resume
      resume()
    }
  }

  updateStack() {
    if (typeof window === 'undefined') return
    const container = document.getElementById(this.containerId)
    if (!container) return

    const isHovering = this.isHovering
    const activeToasts = this.toasts.slice().reverse()

    activeToasts.forEach((toast, index) => {
      const { el } = toast
      if (index >= toastConfig.maxToasts) {
        el.style.opacity = '0'
        el.style.pointerEvents = 'none'
        return
      }

      if (isHovering) {
        const yOffset = index * (el.offsetHeight + 10)
        el.style.transform = `translateY(${yOffset}px) scale(1)`
        el.style.opacity = '1'
        el.style.zIndex = String(activeToasts.length - index)
      } else {
        const scale = 1 - index * toastConfig.stackScale
        const yOffset = index * toastConfig.stackGap
        el.style.transform = `translateY(${yOffset}px) scale(${scale})`
        el.style.opacity = index === 0 ? '1' : String(1 - index * 0.2)
        el.style.zIndex = String(activeToasts.length - index)
      }
    })
  }

  close(toastId: string) {
    const index = this.toasts.findIndex(t => t.id === toastId)
    if (index === -1) return

    const { el, root } = this.toasts[index]
    this.toasts.splice(index, 1)

    const currentTransform = el.style.transform
    const match = currentTransform.match(/translateY\(([^)]+)\)/)
    const currentTranslateY = match ? match[1] : '0px'

    el.style.transition = 'all 0.4s cubic-bezier(0.32, 0.72, 0, 1)'
    el.style.transform = `translateY(calc(${currentTranslateY} + 20px)) scale(0.9)`
    el.style.opacity = '0'
    el.style.pointerEvents = 'none'

    window.setTimeout(() => {
      root.unmount()
      if (el.parentElement) el.parentElement.removeChild(el)
      this.updateStack()
      this.processQueue()
    }, 400)
  }
}

const service = new ToastService()

type ToastFn = ((message: string, duration?: number) => void) & {
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
}

const toast = ((message: string, duration?: number) => {
  service.show(message, 'info', duration)
}) as ToastFn

toast.success = (message, duration) => service.show(message, 'success', duration)
toast.error = (message, duration) => service.show(message, 'error', duration)
toast.info = (message, duration) => service.show(message, 'info', duration)
toast.warning = (message, duration) => service.show(message, 'warning', duration)

if (typeof window !== 'undefined') {
  ;(window as any).Toast = service
}

export default toast
