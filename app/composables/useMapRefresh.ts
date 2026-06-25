import { ref, onMounted, onUnmounted } from 'vue'
import { settingsApi } from '~/api/settings'

export function useMapRefresh(onRefresh: () => void) {
  const interval = ref(30)
  const lastRefreshed = ref(new Date())
  const secondsAgo = ref(0)
  let refreshTimer: ReturnType<typeof setInterval> | null = null
  let countTimer: ReturnType<typeof setInterval> | null = null

  async function fetchInterval() {
    try {
      const response = await settingsApi.getGpsSettings()
      if (response.rc === 0) {
        interval.value = response.map_refresh_interval ?? 30
      }
    } catch {
      interval.value = 30
    }
  }

  function startTimers() {
    stopTimers()
    refreshTimer = setInterval(() => {
      lastRefreshed.value = new Date()
      secondsAgo.value = 0
      onRefresh()
    }, interval.value * 1000)

    countTimer = setInterval(() => {
      secondsAgo.value = Math.floor((Date.now() - lastRefreshed.value.getTime()) / 1000)
    }, 1000)
  }

  function stopTimers() {
    if (refreshTimer) clearInterval(refreshTimer)
    if (countTimer) clearInterval(countTimer)
    refreshTimer = null
    countTimer = null
  }

  function refreshNow() {
    lastRefreshed.value = new Date()
    secondsAgo.value = 0
    onRefresh()
    startTimers()
  }

  onMounted(async () => {
    await fetchInterval()
    startTimers()
  })

  onUnmounted(() => {
    stopTimers()
  })

  return {
    interval,
    secondsAgo,
    lastRefreshed,
    refreshNow,
  }
}
