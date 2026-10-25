<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TemplateEditor from '~/components/reports/TemplateEditor.vue'
import { reportTemplateApi } from '~/api/reportTemplate'
import type { ReportTemplate } from '~/api/types/reportTemplate'

definePageMeta({ layout: 'default' })

const route = useRoute()
const { t } = useTranslation()

const template = ref<ReportTemplate | null>(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await reportTemplateApi.getTemplate(Number(route.params.id), { showLoading: false })
    template.value = res.template ?? null
    if (!template.value) error.value = t('tpl.not_found')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load template'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="reports-editor-page">
    <div v-if="loading" class="page-state">
      <Icon name="lucide:loader-2" :size="28" class="spin" />
    </div>
    <div v-else-if="error" class="page-state page-state--error">
      <Icon name="lucide:alert-circle" :size="28" />
      <p>{{ error }}</p>
      <NuxtLink to="/report-templates" class="back-link">{{ t('common.back') }}</NuxtLink>
    </div>
    <TemplateEditor v-else mode="edit" :template="template ?? undefined" />
  </div>
</template>

<style scoped>
.reports-editor-page {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.page-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  color: var(--color-text-muted);
}

.back-link {
  color: var(--color-accent);
  font-size: var(--font-size-sm);
}

.spin { animation: spin 1s linear infinite; }
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>
