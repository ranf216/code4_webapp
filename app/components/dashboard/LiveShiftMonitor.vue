<script setup lang="ts">
import { shiftApi } from '~/api/shift'
import type { Shift as ApiShift, ShiftCheckin, ShiftDetails } from '~/api/types/shift'

interface MonitorOfficer {
  id: string
  name: string
  checkedIn: boolean
  checkInOn: string | null
}

interface MonitorPost {
  id: number
  name: string
  officerId: string
  fulfilled: boolean
}

interface MonitorShift {
  shift: ApiShift
  details: ShiftDetails | null
  officers: MonitorOfficer[]
  posts: MonitorPost[]
}

const { t } = useTranslation()
const monitorShifts = ref<MonitorShift[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const lastUpdated = ref<Date | null>(null)
const nowTimestamp = ref(Date.now())
let refreshTimer: ReturnType<typeof setInterval> | null = null
let clockTimer: ReturnType<typeof setInterval> | null = null

function todayString(): string {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function parseLocalDateTime(value: string): number {
  return new Date(value.replace(' ', 'T')).getTime()
}

function formatTime(value: string | null): string {
  if (!value) return '—'
  const date = new Date(value.replace(' ', 'T'))
  return Number.isNaN(date.getTime()) ? value : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function elapsedTime(shift: ApiShift): string {
  const start = parseLocalDateTime(`${shift.shift_date} ${shift.start_time}`)
  if (Number.isNaN(start)) return '—'
  const minutes = Math.max(0, Math.floor((nowTimestamp.value - start) / 60000))
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`
}

function buildMonitorShift(shift: ApiShift, details: ShiftDetails | null): MonitorShift {
  const checkins: ShiftCheckin[] = details?.checkins || []
  const checkinByOfficer = new Map(checkins.map(checkin => [checkin.officer_id, checkin]))
  const officers = (details?.officers || shift.officers || []).map(officer => {
    const checkin = checkinByOfficer.get(officer.officer_id)
    return {
      id: officer.officer_id,
      name: officer.name,
      checkedIn: !!checkin && !checkin.check_out_on,
      checkInOn: checkin?.check_in_on || null,
    }
  })
  const checkedInIds = new Set(officers.filter(officer => officer.checkedIn).map(officer => officer.id))
  const posts = (details?.posts || shift.posts || []).map(post => ({
    id: post.post_id,
    name: post.post_name,
    officerId: post.officer_id,
    fulfilled: checkedInIds.has(post.officer_id),
  }))
  return { shift, details, officers, posts }
}

async function loadActiveShifts() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const date = todayString()
    const response = await shiftApi.getShiftsCalendar({
      date_from: date,
      date_to: date,
      status: 'active',
    }, { showLoading: false })
    const activeShifts: ApiShift[] = (response.shifts || []) as ApiShift[]
    const details = await Promise.all(activeShifts.map((shift: ApiShift) => shiftApi.getShift(shift.shift_id, { showLoading: false }).then(result => result.shift).catch(() => null)))
    monitorShifts.value = activeShifts.map((shift: ApiShift, index: number) => buildMonitorShift(shift, details[index] || null))
    lastUpdated.value = new Date()
  } catch (error) {
    console.error('Failed to load live shift monitor:', error)
    errorMessage.value = error instanceof Error ? error.message : t('shifts.live_monitor_load_failed')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadActiveShifts()
  refreshTimer = setInterval(loadActiveShifts, 60000)
  clockTimer = setInterval(() => { nowTimestamp.value = Date.now() }, 60000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
  if (clockTimer) clearInterval(clockTimer)
})
</script>

<template>
  <section class="live-shift-monitor card">
    <div class="monitor-header">
      <div>
        <span class="monitor-title">{{ t('shifts.live_shift_monitor') }}</span>
        <span class="monitor-subtitle">{{ lastUpdated ? `${t('shifts.last_updated')} ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '' }}</span>
      </div>
      <button class="monitor-refresh" :disabled="isLoading" @click="loadActiveShifts">
        <Icon name="lucide:refresh-cw" :size="14" :class="{ spin: isLoading }" />
        {{ t('common.refresh') }}
      </button>
    </div>

    <div v-if="isLoading && !monitorShifts.length" class="monitor-state"><Icon name="lucide:loader-2" :size="20" class="spin" /> {{ t('common.loading') }}</div>
    <div v-else-if="errorMessage" class="monitor-state monitor-state--error">{{ errorMessage }}<button class="btn btn--secondary" @click="loadActiveShifts">{{ t('common.retry') }}</button></div>
    <div v-else-if="!monitorShifts.length" class="monitor-state">{{ t('shifts.no_active_shifts') }}</div>
    <div v-else class="monitor-table-wrap">
      <table class="monitor-table">
        <thead>
          <tr>
            <th>{{ t('shifts.community') }}</th>
            <th>{{ t('shifts.shift_time') }}</th>
            <th>{{ t('shifts.officers') }}</th>
            <th>{{ t('shifts.check_in_time') }}</th>
            <th>{{ t('shifts.unfulfilled_posts') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in monitorShifts" :key="item.shift.shift_id">
            <td><strong>{{ item.shift.community_name || '—' }}</strong></td>
            <td><span>{{ item.shift.start_time }} - {{ item.shift.end_time }}</span><small>{{ t('shifts.elapsed') }}: {{ elapsedTime(item.shift) }}</small></td>
            <td><div class="monitor-officers"><span v-for="officer in item.officers" :key="officer.id" class="monitor-officer"><i :class="officer.checkedIn ? 'status-dot status-dot--checked' : 'status-dot status-dot--missing'" />{{ officer.name }}</span></div></td>
            <td><div class="monitor-checkins"><span v-for="officer in item.officers" :key="`time-${officer.id}`"><strong>{{ officer.name }}</strong> {{ officer.checkedIn ? formatTime(officer.checkInOn) : t('shifts.not_checked_in') }}</span></div></td>
            <td><span v-if="item.posts.filter(post => !post.fulfilled).length" class="unfulfilled-posts">{{ item.posts.filter(post => !post.fulfilled).map(post => post.name).join(', ') }}</span><span v-else class="all-posts-fulfilled">{{ t('shifts.all_posts_fulfilled') }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.live-shift-monitor { overflow: hidden; }
.monitor-header { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--color-border); }
.monitor-title { display: block; color: var(--color-text-secondary); font-size: var(--font-size-base); font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
.monitor-subtitle { display: block; margin-top: 3px; color: var(--color-text-muted); font-size: var(--font-size-xs); }
.monitor-refresh { display: inline-flex; align-items: center; gap: var(--space-2); height: 32px; padding: 0 var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-elevated); color: var(--color-text-primary); cursor: pointer; }
.monitor-table-wrap { overflow-x: auto; }
.monitor-table { width: 100%; min-width: 900px; border-collapse: collapse; color: var(--color-text-secondary); font-size: var(--font-size-xs); }
.monitor-table th, .monitor-table td { padding: var(--space-3); border-bottom: 1px solid var(--color-border-subtle); text-align: left; vertical-align: top; }
.monitor-table th { color: var(--color-text-muted); font-weight: 600; white-space: nowrap; }
.monitor-table td strong { color: var(--color-text-primary); }
.monitor-table td small { display: block; margin-top: 3px; color: var(--color-accent); }
.monitor-officers, .monitor-checkins { display: flex; flex-direction: column; gap: var(--space-1); }
.monitor-officer, .monitor-checkins span { display: inline-flex; align-items: center; gap: var(--space-1); white-space: nowrap; }
.monitor-checkins strong { min-width: 90px; color: var(--color-text-secondary) !important; font-weight: 500; }
.status-dot { width: 7px; height: 7px; border-radius: 50%; }
.status-dot--checked { background: var(--color-ok); }
.status-dot--missing { background: var(--color-warn); }
.unfulfilled-posts { color: var(--color-warn); }
.all-posts-fulfilled { color: var(--color-ok); }
.monitor-state { display: flex; min-height: 120px; align-items: center; justify-content: center; gap: var(--space-2); color: var(--color-text-muted); }
.monitor-state--error { flex-direction: column; color: var(--color-critical); }
.monitor-refresh:disabled { opacity: .6; cursor: not-allowed; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
