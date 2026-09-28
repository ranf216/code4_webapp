<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const { t } = useTranslation()
</script>

<template>
  <AppHeader
    :title="t('nav.asset_types')"
    :breadcrumb="[{ label: 'Admin' }, { label: t('nav.asset_types') }]"
  />
  <div class="asset-types-page">
    <AssetTypes hide-title />
  </div>
</template>

<style scoped>
.asset-types-page {
  flex: 1;
  padding: var(--space-6);
  overflow-y: auto;
}
</style>
