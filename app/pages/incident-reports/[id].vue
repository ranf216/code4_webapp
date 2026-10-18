<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const { t } = useTranslation()

const reportId = computed(() => Number(route.params.id))

function goBack() {
  router.push('/incident-reports')
}
</script>

<template>
  <div class="review-page">
    <div class="review-page__header">
      <button class="back-btn" :title="t('reports.back_to_list')" @click="goBack">
        <Icon name="lucide:arrow-left" :size="16" />
      </button>
      <div class="review-page__title-area">
        <h1 class="review-page__title">{{ t('reports.report_details') }}</h1>
        <!-- <p class="review-page__subtitle">#{{ reportId }}</p> -->
      </div>
    </div>
    <ReportReviewStudio :report-id="reportId" />
  </div>
</template>

<style scoped>
.review-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.review-page__header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-surface);
  flex-shrink: 0;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  flex-shrink: 0;
  transition: all var(--transition-base);
  margin-top: 0px;
}

.back-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.review-page__title-area { flex: 1; }
.review-page__title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}
.review-page__subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: var(--space-1) 0 0;
}

@media (max-width: 768px) {
  .review-page__subtitle { display: none; }
}
</style>
