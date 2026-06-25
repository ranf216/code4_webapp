<script setup lang="ts">

definePageMeta({
  layout: 'default',
})

const { t } = useTranslation()
const route = useRoute()
const router = useRouter()

type TabId = 'open' | 'history' | 'reports'

// Tab configuration
const tabs = [
  { id: 'open' as TabId, label: t('calls.tabs.open'), icon: 'lucide:phone-call' },
  { id: 'history' as TabId, label: t('calls.tabs.history'), icon: 'lucide:history' },
  { id: 'reports' as TabId, label: t('calls.tabs.reports'), icon: 'lucide:file-text' },
] as const

const validTabIds = tabs.map((tab) => tab.id) as TabId[]

// Init from URL query, fallback to 'open'
const activeTab = ref<TabId>(
  validTabIds.includes(route.query.tab as TabId) ? (route.query.tab as TabId) : 'open',
)

function setTab(id: TabId) {
  activeTab.value = id
  router.replace({ query: { tab: id } })
}
</script>

<template>
  <AppHeader
    :title="t('calls.page_title')"
    :breadcrumb="[{ label: 'Manage' }, { label: t('calls.page_title') }]"
  />
  <div class="calls-page">
    <!-- Tab Navigation -->
    <div class="calls-tabs">
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
    <div class="calls-content">
      <!-- Open Calls Tab -->
      <div v-if="activeTab === 'open'" class="content-card">
        <CallsList />
      </div>

      <!-- History Tab -->
      <div v-else-if="activeTab === 'history'" class="content-card">
        <CallsHistory />
      </div>

      <!-- Incident Reports Tab -->
      <div v-else-if="activeTab === 'reports'" class="content-card">
        <IncidentReports />
      </div>
    </div>
  </div>
</template>

<style scoped>
.calls-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--space-6);
  overflow-y: auto;
}

/* Tab Navigation */
.calls-tabs {
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
.calls-content {
  min-height: 400px;
}

.content-card {
  padding: 0;
}


/* Responsive */
@media (max-width: 768px) {
  .calls-tabs {
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
