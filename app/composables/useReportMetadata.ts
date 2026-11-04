import { reportApi } from '~/api/report'
import type { GetReportMetadataResponse } from '~/api/types/report'

const metadata = ref<GetReportMetadataResponse | null>(null)
let fetchPromise: Promise<void> | null = null

export function useReportMetadata() {
  async function fetchReportMetadata() {
    if (metadata.value) return
    if (!fetchPromise) {
      fetchPromise = (async () => {
        try {
          const response = await reportApi.getReportMetadata()
          if (response.rc === 0) {
            metadata.value = {
              statuses: response.statuses ?? {},
              categories: response.categories ?? {},
              history_actions: response.history_actions ?? {},
            } as GetReportMetadataResponse
          }
        } catch (err) {
          console.error('Failed to load report metadata:', err)
        } finally {
          fetchPromise = null
        }
      })()
    }
    await fetchPromise
  }

  function statusLabel(status: string, fallback?: string): string {
    return metadata.value?.statuses?.[status as keyof typeof metadata.value.statuses] ?? fallback ?? status
  }

  function categoryLabel(category: string, fallback?: string): string {
    return metadata.value?.categories?.[category as keyof typeof metadata.value.categories] ?? fallback ?? category
  }

  function historyActionLabel(action: string, fallback?: string): string {
    return metadata.value?.history_actions?.[action as keyof typeof metadata.value.history_actions] ?? fallback ?? action
  }

  return { metadata, fetchReportMetadata, statusLabel, categoryLabel, historyActionLabel }
}
