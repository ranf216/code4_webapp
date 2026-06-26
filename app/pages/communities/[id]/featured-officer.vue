<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { communityApi } from '~/api/community'

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const communityId = route.params.id as string
const communityName = ref('Loading...')
const isLoading = ref(true)
const showSuccessModal = ref(false)
const successMessage = ref('')

// Get community name from API
async function fetchCommunityName() {
  try {
    const response = await communityApi.getCommunity(Number(communityId))
    if (response.rc === 0 && response.community) {
      communityName.value = response.community.name
    }
  } catch (error) {
    console.error('Error fetching community:', error)
    communityName.value = 'Unknown Community'
  } finally {
    isLoading.value = false
  }
}

// Handle success from child component
function handleSuccess(message: string) {
  successMessage.value = message
  showSuccessModal.value = true
}

// Handle cancel from child component
function handleCancel() {
  navigateBack()
}

// Navigate back to previous page
function navigateBack() {
  // Check if we came from community list via query parameter
  const route = useRoute()
  const fromList = route.query.from === 'list'
  
  if (fromList) {
    // Go back to community list with refresh parameter
    router.push('/communities?refresh=true')
  } else {
    router.push(`/communities/edit/${communityId}`)
  }
}

// Handle success modal OK button
function handleSuccessModalOk() {
  showSuccessModal.value = false
  navigateBack()
}

onMounted(() => {
  fetchCommunityName()
})
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
    <FeaturedOfficer 
      :community-id="communityId" 
      :community-name="communityName" 
      @success="handleSuccess"
      @cancel="handleCancel"
    />
    
    <!-- Success Modal -->
    <AppModal
      :show="showSuccessModal"
      title="Success"
      :message="successMessage"
      :cancel-text="undefined"
      ok-text="OK"
      @close="handleSuccessModalOk"
      @ok="handleSuccessModalOk"
    />
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
