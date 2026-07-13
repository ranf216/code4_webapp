import { defineStore } from 'pinia'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: number
  message: string
  type: ToastType
  duration: number
}

let _nextId = 1

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<ToastItem[]>([])

  function show(message: string, type: ToastType = 'info', duration = 3500) {
    const id = _nextId++
    toasts.value.push({ id, message, type, duration })
  }

  function success(message: string, duration = 3500) {
    show(message, 'success', duration)
  }

  function error(message: string, duration = 4500) {
    show(message, 'error', duration)
  }

  function info(message: string, duration = 3500) {
    show(message, 'info', duration)
  }

  function warning(message: string, duration = 3500) {
    show(message, 'warning', duration)
  }

  function remove(id: number) {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx > -1) toasts.value.splice(idx, 1)
  }

  return { toasts, show, success, error, info, warning, remove }
})
