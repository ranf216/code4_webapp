<script setup lang="ts">
definePageMeta({ layout: 'default' })
</script>

<template>
  <AppHeader
    title="Communities"
    :breadcrumb="[{ label: 'Manage' }, { label: 'Overview' }]"
    :show-search="true"
  />
  <div class="communities-page">
    <CommunitiesManagement />
  </div>
</template>

<style scoped>
.communities-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--space-6);
  overflow-y: auto;
}
</style>
