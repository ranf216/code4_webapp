<script setup lang="ts">
import { computed } from 'vue'
import type { HistoryEntry } from '~/components/post-orders/PostOrderHistory.vue'

definePageMeta({ layout: 'default' })

const { t } = useTranslation()
const route = useRoute()
const postOrderId = computed(() => route.params.id as string)

const DEMO_HISTORY: Record<string, HistoryEntry[]> = {
  'PO-001': [
    {
      version: '1.2',
      versionType: 'minor',
      publishedBy: 'Sarah Mitchell',
      publishedAt: '2026-05-10T09:14:00Z',
      effectiveDate: '2026-05-01',
      changeSummary: 'Clarified patrol frequency during peak hours and updated radio channel.',
    },
    {
      version: '1.1',
      versionType: 'minor',
      publishedBy: 'Sarah Mitchell',
      publishedAt: '2026-03-22T14:30:00Z',
      effectiveDate: '2026-03-22',
      changeSummary: 'Added new emergency contact numbers for site manager.',
    },
    {
      version: '1.0',
      versionType: 'major',
      publishedBy: 'James Okafor',
      publishedAt: '2026-01-15T08:00:00Z',
      effectiveDate: '2026-01-15',
      changeSummary: 'Initial publish of Main Entrance Post Order.',
    },
  ],
  'PO-002': [],
}

const historyEntries = computed<HistoryEntry[]>(
  () => DEMO_HISTORY[postOrderId.value] ?? []
)

function handleViewVersion(entry: HistoryEntry) {
  console.log('View version', entry.version)
}
</script>

<template>
  <AppHeader
    :title="t('post_orders.edit_page_title')"
    :breadcrumb="[
      { label: t('nav.manage') },
      { label: t('nav.post_orders'), to: '/post-orders' },
      { label: postOrderId },
    ]"
  />
  <div class="edit-post-order-page">
    <PostOrderForm
      mode="edit"
      :post-order-id="postOrderId"
      :history-entries="historyEntries"
    />
  </div>
</template>

<style scoped>
.edit-post-order-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-6);
  overflow-y: auto;
}

.edit-post-order-page :deep(.history-card) {
  max-width: 960px;
  width: 100%;
}
</style>
