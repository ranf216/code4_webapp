<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { communityApi } from '~/api/community'
import type { Community } from '~/api/community'
import { useTranslation } from '~/composables/useI18n'
import type { DashboardDatePreset, DashboardDateRange, DashboardScope } from '~/composables/useDashboard'
import { presetToRange } from '~/composables/useDashboard'

const props = defineProps<{
  communityId: number
  scope: DashboardScope
  dateRange: DashboardDateRange
}>()

const emit = defineEmits<{
  (e: 'update:community', id: number): void
  (e: 'update:scope', scope: DashboardScope): void
  (e: 'update:date-range', range: DashboardDateRange): void
}>()

const { t } = useTranslation()

const communities = ref<Community[]>([])

const presets: { key: DashboardDatePreset; labelKey: string }[] = [
  { key: 'today', labelKey: 'dashboard.date_today' },
  { key: 'last_7_days', labelKey: 'dashboard.date_last_7' },
  { key: 'last_30_days', labelKey: 'dashboard.date_last_30' },
]

const showCustomPicker = ref(false)
const customFrom = ref('')
const customTo = ref('')
const customError = ref('')

const scopeOptions = computed(() => [
  { label: t('dashboard.scope_all'), value: 'all' },
  { label: t('dashboard.scope_my'), value: 'my' },
])

const scopeValue = computed({
  get: () => props.scope,
  set: (v: string) => emit('update:scope', v as DashboardScope),
})

function selectPreset(preset: DashboardDatePreset) {
  showCustomPicker.value = false
  // Clicking the active preset deselects it — no date range sent.
  if (props.dateRange.preset === preset) {
    emit('update:date-range', { preset: 'none', fromDate: '', toDate: '' })
    return
  }
  emit('update:date-range', { preset, ...presetToRange(preset) })
}

function toggleCustomPicker() {
  showCustomPicker.value = !showCustomPicker.value
  customError.value = ''
  if (showCustomPicker.value && props.dateRange.preset === 'custom') {
    customFrom.value = props.dateRange.fromDate
    customTo.value = props.dateRange.toDate
  }
}

function applyCustomRange() {
  if (!customFrom.value || !customTo.value) {
    customError.value = t('dashboard.custom_range_required')
    return
  }
  if (customFrom.value > customTo.value) {
    customError.value = t('dashboard.custom_range_invalid')
    return
  }
  emit('update:date-range', { preset: 'custom', fromDate: customFrom.value, toDate: customTo.value })
  showCustomPicker.value = false
}

const customLabel = computed(() => {
  if (props.dateRange.preset === 'custom' && props.dateRange.fromDate && props.dateRange.toDate) {
    return `${props.dateRange.fromDate} → ${props.dateRange.toDate}`
  }
  return t('dashboard.date_custom')
})

async function fetchCommunities() {
  try {
    const res = await communityApi.getCommunities({}, { showLoading: false })
    if (res.rc === 0 && res.communities) {
      communities.value = [...res.communities].sort((a, b) => a.name.localeCompare(b.name))
    }
  } catch (err) {
    console.error('Failed to load communities:', err)
  }
}

function onCustomOutsideClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.date-custom')) {
    showCustomPicker.value = false
  }
}

onMounted(() => {
  fetchCommunities()
  document.addEventListener('click', onCustomOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onCustomOutsideClick)
})
</script>

<template>
  <div class="dashboard-controls">
    <!-- Community selector -->
    <div class="control-group control-community">
      <select
        class="community-select"
        :value="communityId"
        @change="emit('update:community', Number(($event.target as HTMLSelectElement).value))"
      >
        <option :value="0">{{ t('dashboard.all_communities') }}</option>
        <option v-for="c in communities" :key="c.community_id" :value="c.community_id">
          {{ c.name }}
        </option>
      </select>
    </div>

    <!-- Date range presets -->
    <div class="control-group control-dates">
      <div class="date-presets">
        <button
          v-for="p in presets"
          :key="p.key"
          type="button"
          class="preset-btn"
          :class="{ 'preset-btn--active': dateRange.preset === p.key }"
          @click="selectPreset(p.key)"
        >
          {{ t(p.labelKey) }}
        </button>
        <div class="date-custom">
          <button
            type="button"
            class="preset-btn"
            :class="{ 'preset-btn--active': dateRange.preset === 'custom' }"
            @click="toggleCustomPicker"
          >
            {{ customLabel }}
          </button>
          <div v-if="showCustomPicker" class="custom-popover">
            <div class="custom-field">
              <label>{{ t('dashboard.custom_from') }}</label>
              <input v-model="customFrom" type="date" class="field-input">
            </div>
            <div class="custom-field">
              <label>{{ t('dashboard.custom_to') }}</label>
              <input v-model="customTo" type="date" class="field-input">
            </div>
            <p v-if="customError" class="custom-error">{{ customError }}</p>
            <AppButton :text="t('common.apply')" type="primary" @click="applyCustomRange" />
          </div>
        </div>
      </div>
    </div>

    <!-- Scope toggle -->
    <div class="control-group control-scope">
      <AppSegmentedControl v-model="scopeValue" :options="scopeOptions" />
    </div>
  </div>
</template>

<style scoped>
.dashboard-controls {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex-wrap: wrap;
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.control-community {
  flex-shrink: 0;
}

.community-select {
  min-width: 220px;
  height: 38px;
  padding: 0 var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.community-select:focus {
  outline: none;
  border-color: var(--color-accent);
}

.control-dates {
  flex: 1;
  display: flex;
  justify-content: center;
}

.date-presets {
  display: flex;
  gap: var(--space-2);
  align-items: center;
  flex-wrap: wrap;
}

.preset-btn {
  height: 30px;
  padding: 0 var(--space-3);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  white-space: nowrap;
}

.preset-btn:hover {
  color: var(--color-text-primary);
  border-color: var(--color-accent);
}

.preset-btn--active {
  background: rgba(229, 255, 68, 0.1);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.date-custom {
  position: relative;
}

.custom-popover {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 260px;
  padding: var(--space-4);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.custom-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.custom-field label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.field-input {
  height: 34px;
  padding: 0 var(--space-2);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.custom-error {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--color-danger, #dc3545);
}

.control-scope {
  flex-shrink: 0;
}

@media (max-width: 991px) {
  .dashboard-controls {
    flex-direction: column;
    align-items: stretch;
  }
  .control-dates {
    justify-content: flex-start;
  }
  .community-select {
    width: 100%;
  }
  .control-scope {
    align-self: flex-start;
  }
}
</style>
