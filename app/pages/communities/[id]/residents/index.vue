<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { communityApi } from '~/api/community'

definePageMeta({ layout: 'default' })

const route = useRoute()
const communityId = route.params.id as string
const communityName = ref('Loading...')

async function loadCommunity() {
  try {
    const response = await communityApi.getCommunity(Number(communityId))
    if (response.rc === 0 && response.community) {
      communityName.value = response.community.name
    } else {
      communityName.value = 'Unknown Community'
    }
  } catch (error) {
    console.error('Failed to load community:', error)
    communityName.value = 'Unknown Community'
  }
}

onMounted(loadCommunity)
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
