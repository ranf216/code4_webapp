<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const { t } = useTranslation()
const route = useRoute()
const router = useRouter()

type TabId = 'service' | 'assets' | 'post-orders' | 'notifications' | 'poi-trespass' | 'gps-tracking' | 'working-hours'

// Tab configuration
const tabs = [
  { id: 'service', label: t('settings.tabs.service_types'), icon: 'lucide:file-warning' },
  { id: 'assets', label: t('settings.tabs.asset_types'), icon: 'lucide:box' },
  { id: 'post-orders', label: t('settings.tabs.post_orders'), icon: 'lucide:clipboard-list' },
  { id: 'notifications', label: t('settings.tabs.notifications'), icon: 'lucide:bell' },
  { id: 'poi-trespass', label: t('settings.tabs.poi_trespass'), icon: 'lucide:shield-alert' },
  { id: 'gps-tracking', label: t('settings.tabs.gps_tracking'), icon: 'lucide:map-pin' },
  { id: 'working-hours', label: t('settings.tabs.working_hours'), icon: 'lucide:clock' },
] as const

const validTabIds = tabs.map((tab) => tab.id) as TabId[]

// Init from URL query, fallback to 'service'
const activeTab = ref<TabId>(
  validTabIds.includes(route.query.tab as TabId) ? (route.query.tab as TabId) : 'service',
)

function setTab(id: TabId) {
  activeTab.value = id
  router.replace({ query: { tab: id } })
}

// Tab titles for content display
const tabTitles: Record<typeof activeTab.value, string> = {
  service: t('settings.titles.service_types'),
  assets: t('settings.titles.asset_types'),
  'post-orders': t('settings.titles.post_orders'),
  notifications: t('settings.titles.notifications'),
  'poi-trespass': t('settings.titles.poi_trespass'),
  'gps-tracking': t('settings.titles.gps_tracking'),
  'working-hours': t('settings.titles.working_hours'),
}
</script>

<template>
  <AppHeader
    :title="t('settings.page_title')"
    :breadcrumb="[{ label: 'Admin' }, { label: t('settings.page_title') }]"
  />
  <div class="settings-page">
    <!-- Tab Navigation -->
    <div class="settings-tabs">
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
    <div class="settings-content">
      <ServiceTypes v-if="activeTab === 'service'" />
      <AssetTypes v-else-if="activeTab === 'assets'" />
      <PostOrderSectionTypes v-else-if="activeTab === 'post-orders'" />
      <PushNotificationSettings v-else-if="activeTab === 'notifications'" />
      <PoiTrespassSettings v-else-if="activeTab === 'poi-trespass'" />
      <GpsTrackingSettings v-else-if="activeTab === 'gps-tracking'" />
      <WorkingHoursSettings v-else-if="activeTab === 'working-hours'" />
      <div v-else class="content-card">
        <h2 class="content-title">{{ tabTitles[activeTab] }}</h2>
        <p class="content-placeholder text-secondary">
          {{ t('settings.placeholder', { section: tabTitles[activeTab] }) }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--space-6);
  overflow-y: auto;
}

/* Tab Navigation */
.settings-tabs {
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
.settings-content {
  min-height: 400px;
}

.content-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
}

.content-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-4);
}

.content-placeholder {
  font-size: var(--font-size-base);
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .settings-tabs {
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
