<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ShiftConflictWarning } from '~/api/types/shift'
import { useTranslation } from '~/composables/useI18n'

const props = withDefaults(defineProps<{
  show: boolean
  warnings: ShiftConflictWarning[]
  confirmText?: string
  confirming?: boolean
}>(), {
  confirmText: 'Confirm',
  confirming: false,
})

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'confirm'): void
}>()

const { t } = useTranslation()
const acknowledged = ref(false)

watch(() => props.show, (visible: boolean) => {
  if (visible) acknowledged.value = false
})

function warningText(warning: ShiftConflictWarning): string {
  return warning.message || t('shifts.conflict_default')
}
</script>

<template>
  <AppModal
    :show="show"
    :title="t('shifts.conflict_title')"
    :cancel-text="t('common.cancel')"
    :ok-text="confirming ? t('common.saving') : confirmText"
    :ok-disabled="!acknowledged || confirming"
    @close="emit('close')"
    @cancel="emit('close')"
    @ok="emit('confirm')"
  >
    <div class="conflict-modal-content">
      <div v-for="(warning, index) in warnings" :key="index" class="conflict-warning-card">
        <Icon name="lucide:triangle-alert" :size="18" />
        <div>
          <strong>{{ warning.type.replaceAll('_', ' ') }}</strong>
          <p>{{ warningText(warning) }}</p>
        </div>
      </div>
      <label class="conflict-acknowledgment">
        <input v-model="acknowledged" type="checkbox" />
        <span>{{ t('shifts.conflict_acknowledgment') }}</span>
      </label>
    </div>
  </AppModal>
</template>

<style scoped>
.conflict-modal-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.conflict-warning-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3);
  border: 1px solid rgba(245, 158, 11, 0.4);
  border-radius: var(--radius-md);
  background: var(--color-warn-bg);
  color: var(--color-warn);
}

.conflict-warning-card strong {
  text-transform: capitalize;
}

.conflict-warning-card p {
  margin-top: var(--space-1);
  color: var(--color-text-secondary);
}

.conflict-acknowledgment {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  color: var(--color-text-primary);
  cursor: pointer;
}

.conflict-acknowledgment input {
  margin-top: 2px;
  accent-color: var(--color-accent);
}
</style>
