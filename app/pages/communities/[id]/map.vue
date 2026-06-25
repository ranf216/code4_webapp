<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({ layout: 'default' })

const route = useRoute()
const communityId = route.params.id as string
const communityName = ref('Sunset Heights')
</script>

<template>
  <AppHeader
    title="2D Map"
    :breadcrumb="[
      { label: 'Manage' },
      { label: 'Communities', to: '/communities' },
      { label: communityName, to: `/communities/edit/${communityId}` },
      { label: '2D Map' }
    ]"
    :show-search="false"
  />
  <div class="map-page">
    <MapManagement :community-id="communityId" :community-name="communityName" />
  </div>
</template>

<style scoped>
.map-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: var(--space-6);
  overflow-y: auto;
  box-sizing: border-box;
}
</style>
