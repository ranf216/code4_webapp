<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({ layout: 'default' })

const { t } = useTranslation()

type TabId = 'shifts' | 'routes'

const tabs = [
  { id: 'shifts' as TabId, label: t('shifts.tabs.shift_management'), icon: 'lucide:calendar' },
  { id: 'routes' as TabId, label: t('shifts.tabs.routes'), icon: 'lucide:route' },
] as const

const activeTab = ref<TabId>('shifts')

function setTab(id: TabId) {
  activeTab.value = id
}
</script>

<template>
  <AppHeader
    :title="t('nav.shifts_routes')"
    :breadcrumb="[{ label: 'Manage' }, { label: t('nav.shifts_routes') }]"
  />
  <div class="shifts-page">
    <!-- Tab Navigation -->
    <div class="shifts-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === tab.id }"
        @click="setTab(tab.id)"
      >
        <Icon :name="tab.icon" :size="16" />
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- Tab Content -->
    <div class="shifts-content">
      <div v-if="activeTab === 'shifts'" class="content-card">
        <ShiftsManagement />
      </div>
      <div v-else-if="activeTab === 'routes'" class="content-card">
        <RoutesManagement />
      </div>
    </div>
  </div>
</template>

<style scoped>
.shifts-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--space-6);
  overflow-y: auto;
}

/* Tab Navigation */
.shifts-tabs {
  display: flex;
  gap: var(--space-1);
  margin-bottom: var(--space-6);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--space-1);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  color: var(--color-text-primary);
  background: var(--color-surface);
}

.tab-btn--active {
  color: var(--color-accent);
  background: rgba(229, 255, 68, 0.1);
}

.tab-btn--active:hover {
  background: rgba(229, 255, 68, 0.15);
}

/* Content Area */
.shifts-content {
  min-height: 400px;
}

.content-card {
  padding: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .shifts-tabs {
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .tab-btn {
    padding: var(--space-2) var(--space-3);
    font-size: var(--font-size-xs);
  }

  .tab-btn span {
    display: none;
  }
}
</style>
