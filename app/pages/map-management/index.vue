<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t } = useTranslation()
</script>

<template>
  <AppHeader
    :title="t('map.title')"
    :breadcrumb="[{ label: 'Operate' }, { label: t('nav.map_assets') }, { label: t('nav.map_workspace') }]"
    :show-search="false"
  />
  <div class="map-page">
    <MapWorkspace />
  </div>
</template>

<style scoped>
.map-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: var(--space-6);
  overflow-y: auto;
  box-sizing: border-box;
}
</style>
