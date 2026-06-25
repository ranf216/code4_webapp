<script setup lang="ts">
const { t } = useTranslation()

// Filter state
const filters = reactive({
  community: '',
  serviceType: '',
  residentName: '',
  officerName: '',
  status: '',
  scheduledStart: '',
  scheduledEnd: '',
  openStart: '',
  openEnd: '',
  search: '',
})

// Mock options for dropdowns
const communities = ['Sunset Valley', 'Greenwood Heights', 'Riverside Commons']
const serviceTypes = ['Medical Assistance', 'Security Patrol', 'Package Delivery', 'Communication Test']
const statuses = ['new', 'accepted']

// Emit filter changes
const emit = defineEmits<{
  'filter-change': [filters: typeof filters]
}>()

// Watch for filter changes
watch(
  filters,
  () => {
    emit('filter-change', { ...filters })
  },
  { deep: true }
)

// Clear all filters
function clearFilters() {
  filters.community = ''
  filters.serviceType = ''
  filters.residentName = ''
  filters.officerName = ''
  filters.status = ''
  filters.scheduledStart = ''
  filters.scheduledEnd = ''
  filters.openStart = ''
  filters.openEnd = ''
  filters.search = ''
}

// Check if any filter is active
const hasActiveFilters = computed(() => {
  return Object.values(filters).some((v) => v !== '')
})
</script>

<template>
  <div class="calls-filters">
    <!-- Row 1: Search, Community, Service Type, Status -->
    <div class="filter-row">
      <!-- Search -->
      <div class="filter-field search-field-inline">
        <label class="filter-label">{{ t('calls.filters.search') }}</label>
        <div class="search-input-wrapper">
          <Icon name="lucide:search" :size="16" class="search-icon" />
          <input
            v-model="filters.search"
            type="text"
            class="search-input"
            :placeholder="t('calls.filters.search_placeholder')"
          />
        </div>
      </div>

      <!-- Community -->
      <div class="filter-field">
        <label class="filter-label">{{ t('calls.filters.community') }}</label>
        <select v-model="filters.community" class="filter-select">
          <option value="">{{ t('calls.filters.all') }}</option>
          <option v-for="c in communities" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>

      <!-- Service Type -->
      <div class="filter-field">
        <label class="filter-label">{{ t('calls.filters.service_type') }}</label>
        <select v-model="filters.serviceType" class="filter-select">
          <option value="">{{ t('calls.filters.all') }}</option>
          <option v-for="s in serviceTypes" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>

      <!-- Status -->
      <div class="filter-field">
        <label class="filter-label">{{ t('calls.filters.status') }}</label>
        <select v-model="filters.status" class="filter-select">
          <option value="">{{ t('calls.filters.all') }}</option>
          <option v-for="s in statuses" :key="s" :value="s">
            {{ s === 'new' ? t('calls.status.new') : t('calls.status.accepted') }}
          </option>
        </select>
      </div>

      <!-- Clear button -->
      <div class="filter-field clear-field" v-if="hasActiveFilters">
        <label class="filter-label">&nbsp;</label>
        <button class="clear-btn" @click="clearFilters">
          <Icon name="lucide:x" :size="14" />
          {{ t('calls.filters.clear') }}
        </button>
      </div>
    </div>

    <!-- Row 2: Resident, Officer, Scheduled Time Range, Open Time Range -->
    <div class="filter-row">
      <!-- Resident -->
      <div class="filter-field">
        <label class="filter-label">{{ t('calls.filters.resident') }}</label>
        <input
          v-model="filters.residentName"
          type="text"
          class="filter-input"
          :placeholder="t('calls.filters.resident_placeholder')"
        />
      </div>

      <!-- Officer -->
      <div class="filter-field">
        <label class="filter-label">{{ t('calls.filters.officer') }}</label>
        <input
          v-model="filters.officerName"
          type="text"
          class="filter-input"
          :placeholder="t('calls.filters.officer_placeholder')"
        />
      </div>

      <!-- Scheduled Time Range -->
      <div class="filter-field date-range">
        <label class="filter-label">{{ t('calls.filters.scheduled_range') }}</label>
        <div class="date-inputs">
          <input v-model="filters.scheduledStart" type="datetime-local" class="filter-date" />
          <span class="range-separator">—</span>
          <input v-model="filters.scheduledEnd" type="datetime-local" class="filter-date" />
        </div>
      </div>

      <!-- Open Time Range -->
      <div class="filter-field date-range">
        <label class="filter-label">{{ t('calls.filters.open_range') }}</label>
        <div class="date-inputs">
          <input v-model="filters.openStart" type="datetime-local" class="filter-date" />
          <span class="range-separator">—</span>
          <input v-model="filters.openEnd" type="datetime-local" class="filter-date" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calls-filters {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-2) 0;
  margin-bottom: var(--space-4);
}

/* Filter Rows */
.filter-row {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.filter-field {
  flex: 1;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

/* Search field inline */
.search-field-inline {
  min-width: 200px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--space-3);
  color: var(--color-text-muted);
}

.search-input {
  width: 100%;
  padding: var(--space-2) var(--space-3) var(--space-2) var(--space-8);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-accent);
}

/* Clear button field */
.clear-field {
  flex: 0 0 auto;
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
  white-space: nowrap;
  height: 35px;
}

.clear-btn:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

/* Date range field */
.filter-field.date-range {
  flex: 2;
  min-width: 280px;
}

.filter-label {
  font-size: var(--font-size-xs);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.filter-select,
.filter-input,
.filter-date {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  height: 35px;
}

.filter-select:focus,
.filter-input:focus,
.filter-date:focus {
  outline: none;
  border-color: var(--color-accent);
}

.date-inputs {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.date-inputs .filter-date {
  flex: 1;
}

.range-separator {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

/* Responsive */
@media (max-width: 1024px) {
  .filter-field {
    min-width: 140px;
  }
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
  }

  .filter-field,
  .filter-field.date-range {
    min-width: 100%;
  }

  .date-inputs {
    flex-direction: column;
    align-items: stretch;
  }

  .range-separator {
    text-align: center;
  }

  .clear-field {
    align-self: flex-end;
  }
}
</style>
