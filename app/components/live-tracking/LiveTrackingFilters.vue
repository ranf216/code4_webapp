<script setup lang="ts">
import { computed } from 'vue'
import { useTranslation } from '~/composables/useI18n'

export interface FilterState {
  community: string
  selectedOfficers: string[]
  showOfficers: boolean
  showRoutes: boolean
  showEmergencyCalls: boolean
  showPosts: boolean
  onDutyOnly: boolean
}

const props = defineProps<{
  modelValue: FilterState
  communities: string[]
  officers: string[]
  refreshInterval: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: FilterState): void
  (e: 'refresh'): void
}>()

const { t } = useTranslation()

const filters = computed({
  get: () => props.modelValue,
  set: (value: FilterState) => emit('update:modelValue', value),
})

function toggleOfficer(officer: string) {
  const selected = new Set(filters.value.selectedOfficers)
  if (selected.has(officer)) {
    selected.delete(officer)
  } else {
    selected.add(officer)
  }
  filters.value = { ...filters.value, selectedOfficers: Array.from(selected) }
}

function toggleLayer(layer: keyof Omit<FilterState, 'community' | 'selectedOfficers' | 'onDutyOnly'>) {
  filters.value = { ...filters.value, [layer]: !filters.value[layer] }
}

function toggleOnDutyOnly() {
  filters.value = { ...filters.value, onDutyOnly: !filters.value.onDutyOnly }
}
</script>

<template>
  <div class="filters-panel">
    <div class="filters-header">
      <h3>{{ t('live_tracking.filters') }}</h3>
      <button class="refresh-btn" @click="$emit('refresh')">
        <Icon name="lucide:refresh-cw" :size="14" />
        {{ t('live_tracking.refresh_now') }}
      </button>
    </div>

    <div class="filter-section">
      <label class="filter-label">{{ t('live_tracking.community') }}</label>
      <select v-model="filters.community" class="filter-select">
        <option value="">{{ t('live_tracking.all_communities') }}</option>
        <option v-for="community in communities" :key="community" :value="community">{{ community }}</option>
      </select>
    </div>

    <div class="filter-section">
      <label class="filter-label">{{ t('live_tracking.officers') }}</label>
      <div class="officer-list">
        <label
          v-for="officer in officers"
          :key="officer"
          class="checkbox-item"
        >
          <input
            type="checkbox"
            :checked="filters.selectedOfficers.includes(officer)"
            @change="toggleOfficer(officer)"
          />
          <span>{{ officer }}</span>
        </label>
      </div>
    </div>

    <div class="filter-section">
      <label class="filter-label">{{ t('live_tracking.layers') }}</label>
      <div class="layer-toggles">
        <label class="toggle-item">
          <input type="checkbox" :checked="filters.showOfficers" @change="toggleLayer('showOfficers')" />
          <span>{{ t('live_tracking.layer_officers') }}</span>
        </label>
        <label class="toggle-item">
          <input type="checkbox" :checked="filters.showRoutes" @change="toggleLayer('showRoutes')" />
          <span>{{ t('live_tracking.layer_routes') }}</span>
        </label>
        <label class="toggle-item">
          <input type="checkbox" :checked="filters.showEmergencyCalls" @change="toggleLayer('showEmergencyCalls')" />
          <span>{{ t('live_tracking.layer_emergency_calls') }}</span>
        </label>
        <label class="toggle-item">
          <input type="checkbox" :checked="filters.showPosts" @change="toggleLayer('showPosts')" />
          <span>{{ t('live_tracking.layer_posts') }}</span>
        </label>
      </div>
    </div>

    <div class="filter-section">
      <label class="toggle-item toggle-item--primary">
        <input type="checkbox" :checked="filters.onDutyOnly" @change="toggleOnDutyOnly" />
        <span>{{ t('live_tracking.on_duty_only') }}</span>
      </label>
    </div>

    <div class="refresh-info">
      <Icon name="lucide:clock" :size="14" />
      <span>{{ t('live_tracking.refresh_interval', { seconds: String(refreshInterval) }) }}</span>
    </div>
  </div>
</template>

<style scoped>
.filters-panel {
  width: 260px;
  min-width: 260px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  overflow-y: auto;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filters-header h3 {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text-primary);
}

.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
}

.refresh-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.filter-label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-select {
  width: 100%;
  height: 36px;
  padding: 0 var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  outline: none;
}

.filter-select:focus {
  border-color: var(--color-accent);
}

.officer-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-height: 180px;
  overflow-y: auto;
  padding-right: var(--space-1);
}

.checkbox-item,
.toggle-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  cursor: pointer;
}

.checkbox-item input,
.toggle-item input {
  width: 16px;
  height: 16px;
  accent-color: var(--color-accent);
  cursor: pointer;
}

.layer-toggles {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.toggle-item--primary {
  padding: var(--space-2);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-weight: 500;
}

.refresh-info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-top: auto;
}
</style>
