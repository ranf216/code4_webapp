<script setup lang="ts">
definePageMeta({ layout: 'default' })
</script>

<template>
  <AppHeader
    title="Add Community"
    :breadcrumb="[{ label: 'Manage' }, { label: 'Communities', to: '/communities' }, { label: 'Add New' }]"
    :show-search="true"
  />
  <div class="add-community-page">
    <AddForm />
  </div>
</template>

<style scoped>
.add-community-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--space-6);
  overflow-y: auto;
}
</style>
