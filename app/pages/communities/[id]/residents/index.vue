<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const communityId = route.params.id as string

// Mock community name - in real app, fetch from API
const communityName = ref('Sunset Heights')
</script>

<template>
  <AppHeader
    title="Residents"
    :breadcrumb="[{ label: 'Manage' }, { label: 'Communities', to: '/communities' }, { label: communityName, to: `/communities/edit/${communityId}` }, { label: 'Residents' }]"
    :show-search="false"
  />
  <div class="residents-page">
    <ResidentsManagement :community-id="communityId" :community-name="communityName" />
  </div>
</template>

<style scoped>
.residents-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--space-6);
  overflow-y: auto;
}
</style>
