<script setup lang="ts">
import { computed } from 'vue'

definePageMeta({ layout: 'default' })

const { t } = useTranslation()
const route = useRoute()
const postOrderId = computed(() => route.params.id as string)
</script>

<template>
  <AppHeader
    :title="t('post_orders.edit_page_title')"
    :breadcrumb="[
      { label: t('nav.manage') },
      { label: t('nav.post_orders'), to: '/post-orders' },
      { label: `PO-${postOrderId}` },
    ]"
  />
  <div class="edit-post-order-page">
    <PostOrderForm
      mode="edit"
      :post-order-id="postOrderId"
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
