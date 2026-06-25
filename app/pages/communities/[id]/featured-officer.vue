<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({ layout: 'default' })

const route = useRoute()
const communityId = route.params.id as string

// Mock - in real app fetch from API
const communityName = ref('Sunset Heights')
</script>

<template>
  <AppHeader
    title="Featured Officer"
    :breadcrumb="[
      { label: 'Manage' },
      { label: 'Communities', to: '/communities' },
      { label: communityName, to: `/communities/edit/${communityId}` },
      { label: 'Featured Officer' }
    ]"
    :show-search="false"
  />
  <div class="featured-officer-page">
    <FeaturedOfficer :community-id="communityId" :community-name="communityName" />
  </div>
</template>

<style scoped>
.featured-officer-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: var(--space-6);
  overflow-y: auto;
  box-sizing: border-box;
}
</style>
