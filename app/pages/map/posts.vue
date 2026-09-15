<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t } = useTranslation()
</script>

<template>
  <AppHeader
    :title="t('map.posts')"
    :breadcrumb="[{ label: 'Operate' }, { label: t('nav.map_assets') }, { label: t('map.list_view') }]"
    :show-search="false"
  />
  <div class="posts-page">
    <PostsGridView />
  </div>
</template>

<style scoped>
.posts-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: var(--space-6);
  overflow-y: auto;
  box-sizing: border-box;
}
</style>
