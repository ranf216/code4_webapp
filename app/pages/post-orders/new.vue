<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t } = useTranslation()
</script>

<template>
  <AppHeader
    :title="t('post_orders.create_page_title')"
    :breadcrumb="[
      { label: t('nav.manage') },
      { label: t('nav.post_orders'), to: '/post-orders' },
      { label: t('post_orders.create_new') },
    ]"
  />
  <div class="new-post-order-page">
    <PostOrderForm />
  </div>
</template>

<style scoped>
.new-post-order-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--space-6);
  overflow-y: auto;
}
</style>
