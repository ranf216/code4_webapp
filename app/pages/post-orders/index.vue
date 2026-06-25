<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t } = useTranslation()
</script>

<template>
  <AppHeader
    :title="t('nav.post_orders')"
    :breadcrumb="[{ label: t('nav.manage') }, { label: t('nav.post_orders') }]"
  />
  <div class="post-orders-page">
    <div class="content-card">
      <PostOrdersList />
    </div>
  </div>
</template>

<style scoped>
.post-orders-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--space-6);
  overflow-y: auto;
}

.content-card {
  padding: 0;
}
</style>
