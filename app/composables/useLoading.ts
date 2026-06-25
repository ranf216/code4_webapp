import { useLoadingStore } from '~/stores/loading'

export const useLoading = () => {
  const loadingStore = useLoadingStore()

  /**
   * Show loading with message
   */
  const showLoading = (message?: string) => {
    loadingStore.show(message)
  }

  /**
   * Hide loading
   */
  const hideLoading = () => {
    loadingStore.hide()
  }

  /**
   * Execute async function with loading state
   */
  const withLoading = async <T>(fn: () => Promise<T>, message?: string): Promise<T> => {
    return loadingStore.withLoading(fn, message)
  }

  return {
    // State
    isLoading: computed(() => loadingStore.showLoading),
    loadingMessage: computed(() => loadingStore.message),
    
    // Actions
    showLoading,
    hideLoading,
    withLoading,
  }
}
