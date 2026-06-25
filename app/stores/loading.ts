import { defineStore } from 'pinia'

interface LoadingState {
  isLoading: boolean
  message: string
  requestCount: number
}

export const useLoadingStore = defineStore('loading', {
  state: (): LoadingState => ({
    isLoading: false,
    message: 'Loading...',
    requestCount: 0,
  }),

  getters: {
    showLoading: (state) => state.isLoading && state.requestCount > 0,
  },

  actions: {
    /**
     * Show loading with optional message
     */
    show(message?: string) {
      this.message = message || 'Loading...'
      this.requestCount++
      this.isLoading = true
    },

    /**
     * Hide loading
     */
    hide() {
      this.requestCount = Math.max(0, this.requestCount - 1)
      if (this.requestCount === 0) {
        this.isLoading = false
        this.message = 'Loading...'
      }
    },

    /**
     * Force hide all loading states
     */
    hideAll() {
      this.requestCount = 0
      this.isLoading = false
      this.message = 'Loading...'
    },

    /**
     * Execute function with loading state
     */
    async withLoading<T>(fn: () => Promise<T>, message?: string): Promise<T> {
      try {
        this.show(message)
        const result = await fn()
        return result
      } finally {
        this.hide()
      }
    },
  },
})
