<template>
  <AppHeader
    title="Tasks"
    :breadcrumb="[{ label: 'Operate' }, { label: 'Tasks' }]"
    search-placeholder="Search tasks..."
    :showSearch="false"
  />
  <div class="tasks-page">
    <TasksManagement />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
</script>

<style scoped>
.tasks-page {
  padding: var(--space-4);
}
</style>
