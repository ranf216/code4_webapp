<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const communityId = route.params.id as string

const communityName = ref('Community')

// In real app, fetch community name by id
const communityMap: Record<string, string> = {
  'CM-0482': 'Westridge Estates',
  'CM-0483': 'Harbor Point Marina',
  'CM-0484': 'Cedar Crossing HOA',
  'CM-0485': 'Summit Plaza Events',
}
communityName.value = communityMap[communityId] ?? communityId
</script>

<template>
  <AppHeader
    title="Officers"
    :breadcrumb="[
      { label: 'Manage' },
      { label: 'Communities', to: '/communities' },
      { label: communityName, to: `/communities/edit/${communityId}` },
      { label: 'Officers' },
    ]"
    :show-search="false"
  />
  <div class="officers-page">
    <OfficersManagement :community-id="communityId" :community-name="communityName" />
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
