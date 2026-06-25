<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const communityId = route.params.id as string
</script>

<template>
  <AppHeader
    title="Edit Community"
    :breadcrumb="[{ label: 'Manage' }, { label: 'Communities', to: '/communities' }, { label: 'Edit' }]"
    :show-search="true"
  />
  <div class="edit-community-page">
    <EditForm :community-id="communityId" />
  </div>
</template>

<style scoped>
.edit-community-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--space-6);
  overflow-y: auto;
}
</style>
