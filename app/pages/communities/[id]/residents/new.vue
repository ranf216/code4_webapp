<script setup lang="ts">
import { ref } from 'vue'
import ResidentsAddForm from '~/components/residents/AddForm.vue'

definePageMeta({ layout: 'default' })

const route = useRoute()
const communityId = route.params.id as string

// Mock community name - in real app, fetch from API
const communityName = ref('Sunset Heights')
</script>

<template>
  <AppHeader
    title="Add New Resident"
    :breadcrumb="[
      { label: 'Manage' },
      { label: 'Communities', to: '/communities' },
      { label: communityName, to: `/communities/edit/${communityId}` },
      { label: 'Residents', to: `/communities/${communityId}/residents` },
      { label: 'Add New' }
    ]"
    :show-search="false"
  />
  <div class="add-resident-page">
    <ResidentsAddForm :community-id="communityId" :community-name="communityName" />
  </div>
</template>

<style scoped>
.add-resident-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: var(--space-6);
  overflow-y: auto;
  box-sizing: border-box;
}
</style>
