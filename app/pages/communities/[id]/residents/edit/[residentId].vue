<script setup lang="ts">
import { ref } from 'vue'
import type { Resident } from '~/types/resident'

definePageMeta({ layout: 'default' })

const route = useRoute()
const communityId = route.params.id as string
const residentId = route.params.residentId as string

// Mock community name - in real app, fetch from API
const communityName = ref('Sunset Heights')

// Mock resident data - in real app, fetch from API using residentId
const resident = ref<Resident>({
  id: residentId,
  fullName: 'John Smith',
  mobile: '+1 234 567 8900',
  email: 'john.smith@example.com',
  address: '123 Main Street, Apt 4B',
  registrationDate: '2024-01-15',
  active: true,
  communicationTest: false,
  vehicleNumbers: ['ABC-1234', 'XYZ-5678'],
})
</script>

<template>
  <AppHeader
    title="Edit Resident"
    :breadcrumb="[
      { label: 'Manage' },
      { label: 'Communities', to: '/communities' },
      { label: communityName, to: `/communities/edit/${communityId}` },
      { label: 'Residents', to: `/communities/${communityId}/residents` },
      { label: resident.fullName }
    ]"
    :show-search="false"
  />
  <div class="edit-resident-page">
    <EditForm
      :resident="resident"
      :community-id="communityId"
      :community-name="communityName"
    />
  </div>
</template>

<style scoped>
.edit-resident-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: var(--space-6);
  overflow-y: auto;
  box-sizing: border-box;
}
</style>
