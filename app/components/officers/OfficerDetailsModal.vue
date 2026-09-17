<script setup lang="ts">
import type { Officer, OfficerEvaluation } from '~/api/types/officer'

const props = defineProps<{
  show: boolean
  officer: (Officer & { evaluations?: OfficerEvaluation[] }) | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { t } = useTranslation()

const fullName = computed(() => props.officer
  ? [props.officer.first_name, props.officer.last_name].filter(Boolean).join(' ')
  : '')
const initials = computed(() => [props.officer?.first_name, props.officer?.last_name]
  .filter(Boolean)
  .map((name) => name!.charAt(0).toUpperCase())
  .join('')
  .slice(0, 2))
const email = computed(() => props.officer?.email?.endsWith('@placeholder.local') ? '' : props.officer?.email)
const registrationDate = computed(() => props.officer?.created_on?.split(' ')[0] || '')

function formatDate(value: string) {
  return value ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'
}
</script>

<template>
  <AppModal
    :show="show"
    :title="fullName"
    :cancel-text="t('common.close')"
    :ok-text="''"
    @close="emit('close')"
    @cancel="emit('close')"
  >
    <div v-if="officer" class="detail-view">
      <div class="detail-header">
        <div v-if="officer.image_url" class="avatar">
          <img :src="officer.image_url" :alt="fullName" />
        </div>
        <div v-else class="avatar avatar--initials">{{ initials }}</div>
        <div class="detail-header-info">
          <p class="detail-title">{{ officer.title }}</p>
          <p class="detail-community">{{ officer.community_name || '—' }}</p>
          <Badge type="status" :value="officer.is_active ? 'active' : 'inactive'" />
        </div>
      </div>

      <div class="detail-grid">
        <div class="detail-row">
          <span class="detail-label">{{ t('officers.mobile') }}</span>
          <span class="detail-value mono">{{ officer.phone_num || '—' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">{{ t('officers.email') }}</span>
          <span class="detail-value">{{ email || '—' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">{{ t('officers.address') }}</span>
          <span class="detail-value">{{ officer.address || '—' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">{{ t('officers.reg_date') }}</span>
          <span class="detail-value mono">{{ registrationDate || '—' }}</span>
        </div>
        <div class="detail-row detail-row--full">
          <span class="detail-label">{{ t('officers.roles') }}</span>
          <div class="tags">
            <Badge v-for="role in officer.roles" :key="role" type="officerRole" :value="role" />
            <span v-if="!officer.roles.length" class="muted">—</span>
          </div>
        </div>
        <div class="detail-row detail-row--full">
          <span class="detail-label">{{ t('officers.certifications') }}</span>
          <div class="tags">
            <Badge v-for="certification in officer.certification_badges" :key="certification" type="officerCert" :value="certification" />
            <span v-if="!officer.certification_badges.length" class="muted">—</span>
          </div>
        </div>
        <div v-if="officer.description" class="detail-row detail-row--full">
          <span class="detail-label">{{ t('officers.description') }}</span>
          <span class="detail-value">{{ officer.description }}</span>
        </div>
      </div>

      <div class="evaluations">
        <h4>{{ t('officers.evaluations') }}</h4>
        <div v-if="officer.evaluations?.length" class="evaluation-list">
          <div v-for="evaluation in officer.evaluations" :key="evaluation.evaluation_id" class="evaluation">
            <div class="evaluation-meta">
              <span>{{ formatDate(evaluation.date) }}</span>
              <span>by {{ evaluation.evaluator_name || t('officers.unknown') }}</span>
            </div>
            <p>{{ evaluation.text }}</p>
          </div>
        </div>
        <p v-else class="muted">{{ t('officers.no_evaluations') }}</p>
      </div>
    </div>
  </AppModal>
</template>

<style scoped>
.detail-view, .detail-header-info, .detail-grid, .detail-row, .evaluations, .evaluation-list { display: flex; flex-direction: column; }
.detail-view { gap: var(--space-5); }
.detail-header { display: flex; align-items: center; gap: var(--space-4); }
.detail-header-info { align-items: flex-start; gap: var(--space-1); }
.avatar { width: 72px; height: 72px; flex-shrink: 0; overflow: hidden; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--color-accent); color: var(--color-bg-base); font-size: var(--font-size-xl); font-weight: 700; }
.avatar img { width: 100%; height: 100%; object-fit: cover; }
.detail-title { font-weight: 600; color: var(--color-text-primary); }
.detail-community, .detail-label, .muted, .evaluation-meta { color: var(--color-text-muted); }
.detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-4); }
.detail-row { gap: var(--space-1); }
.detail-row--full { grid-column: 1 / -1; }
.detail-label { font-size: var(--font-size-xs); text-transform: uppercase; letter-spacing: 0.5px; }
.detail-value { color: var(--color-text-primary); }
.tags { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.evaluations { gap: var(--space-3); padding-top: var(--space-4); border-top: 1px solid var(--color-border); }
.evaluations h4 { color: var(--color-text-primary); }
.evaluation-list { gap: var(--space-3); }
.evaluation { padding: var(--space-3); border-radius: var(--radius-md); background: var(--color-bg-base); }
.evaluation-meta { display: flex; justify-content: space-between; gap: var(--space-2); margin-bottom: var(--space-2); font-size: var(--font-size-xs); }
.evaluation p { color: var(--color-text-primary); }
.mono { font-family: monospace; }
@media (max-width: 600px) { .detail-grid { grid-template-columns: 1fr; } .detail-row--full { grid-column: auto; } }
</style>
