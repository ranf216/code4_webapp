<script setup lang="ts">
import { poiApi } from '~/api/poi'
import type { PoiRecord } from '~/api/types/poi'

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()
const { t } = useTranslation()

const recordId = computed(() => {
  const id = Number(route.params.id)
  return Number.isNaN(id) ? 0 : id
})

const loading = ref(true)
const error = ref('')
const poiRecord = ref<PoiRecord | undefined>(undefined)

onMounted(async () => {
  if (!recordId.value) {
    error.value = t('poi.record_not_found')
    toastStore.error(error.value)
    return
  }
  loading.value = true
  try {
    const response = await poiApi.getPoiRecord(recordId.value)
    poiRecord.value = response.record
  } catch (err) {
    console.error('Failed to load POI record:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load record'
    toastStore.error(error.value)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="poi-edit-page">
    <div v-if="loading" class="poi-edit-page__loading">
      <Icon name="lucide:loader-2" :size="24" class="spin" />
      <span>Loading record…</span>
    </div>
    <div v-else-if="error" class="poi-edit-page__error">
      <Icon name="lucide:alert-circle" :size="24" />
      <span>{{ error }}</span>
      <AppButton :text="t('common.back')" type="secondary" size="sm" @click="router.push('/poi')" />
    </div>
    <POIForm v-else-if="poiRecord" mode="edit" :record="poiRecord" />
    <div v-else class="poi-edit-page__error">
      <Icon name="lucide:alert-circle" :size="24" />
      <span>{{ t('poi.record_not_found') }}</span>
    </div>
  </div>
</template>

<style scoped>
.poi-edit-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.poi-edit-page__loading,
.poi-edit-page__error {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  color: var(--color-text-muted);
}

.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
