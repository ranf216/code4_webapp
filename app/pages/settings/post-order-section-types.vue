<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const { t } = useTranslation()
</script>

<template>
  <AppHeader
    :title="t('nav.po_section_types')"
    :breadcrumb="[{ label: 'Admin' }, { label: t('nav.settings') }, { label: t('nav.po_section_types') }]"
  />
  <div class="po-section-types-page">
    <PostOrderSectionTypes hide-title />
  </div>
</template>

<style scoped>
.po-section-types-page {
  flex: 1;
  padding: var(--space-6);
  overflow-y: auto;
}
</style>
