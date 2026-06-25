<script setup lang="ts">
definePageMeta({ layout: 'default' })
</script>

<template>
  <AppHeader
    title="Users"
    :breadcrumb="[{ label: 'Admin' }, { label: 'Users' }]"
    :show-search="false"
  />
  <div class="users-page">
    <UsersManagement />
  </div>
</template>

<style scoped>
.users-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--space-6);
  overflow-y: auto;
}
</style>
