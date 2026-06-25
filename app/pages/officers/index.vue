<script setup lang="ts">
definePageMeta({ layout: 'default' })
</script>

<template>
  <AppHeader
    title="Officers"
    :breadcrumb="[{ label: 'Manage' }, { label: 'Officers' }]"
    :show-search="true"
  />
  <div class="officers-page">
    <OfficersManagement />
  </div>
</template>

<style scoped>
.officers-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--space-6);
  overflow-y: auto;
}
</style>
