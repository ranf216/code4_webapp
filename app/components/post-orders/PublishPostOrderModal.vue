<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTranslation } from '~/composables/useI18n'

const props = defineProps<{
  show: boolean
  currentVersion?: string
}>()

const emit = defineEmits<{
  close: []
  confirm: [payload: PublishPayload]
}>()

export interface PublishPayload {
  versionType: 'minor' | 'major'
  changeSummary: string
  effectiveDate: string
  notifyOfficers: boolean
}

const { t } = useTranslation()

const versionType = ref<'minor' | 'major'>('minor')
const changeSummary = ref('')
const effectiveDate = ref(new Date().toISOString().slice(0, 10))
const notifyOfficers = ref(true)

const nextVersion = computed(() => {
  const base = props.currentVersion ?? '1.0'
  const [major, minor] = base.split('.').map(Number)
  if (versionType.value === 'major') return `${(major ?? 1) + 1}.0`
  return `${major ?? 1}.${(minor ?? 0) + 1}`
})

const canSubmit = computed(() =>
  changeSummary.value.trim().length > 0 && effectiveDate.value.length > 0
)

function handleConfirm() {
  if (!canSubmit.value) return
  emit('confirm', {
    versionType: versionType.value,
    changeSummary: changeSummary.value.trim(),
    effectiveDate: effectiveDate.value,
    notifyOfficers: notifyOfficers.value,
  })
}

function handleClose() {
  emit('close')
}
</script>

<template>
  <AppDialogModal
    :show="show"
    :title="t('post_orders.publish_modal_title')"
    max-width="520px"
    @close="handleClose"
  >
    <div class="publish-form">
      <!-- Version Type -->
      <div class="pf-field">
        <label class="pf-label">
          {{ t('post_orders.publish_version_type') }}
          <span class="required">*</span>
        </label>
        <div class="pf-radio-group">
          <label class="pf-radio" :class="{ 'pf-radio--active': versionType === 'minor' }">
            <input v-model="versionType" type="radio" value="minor" class="pf-radio__input" />
            <span class="pf-radio__box" />
            <span class="pf-radio__content">
              <span class="pf-radio__title">{{ t('post_orders.publish_version_minor') }}</span>
              <span class="pf-radio__desc">{{ t('post_orders.publish_version_minor_desc') }}</span>
            </span>
            <span class="pf-radio__badge">v{{ nextVersion }}</span>
          </label>
          <label class="pf-radio" :class="{ 'pf-radio--active': versionType === 'major' }">
            <input v-model="versionType" type="radio" value="major" class="pf-radio__input" />
            <span class="pf-radio__box" />
            <span class="pf-radio__content">
              <span class="pf-radio__title">{{ t('post_orders.publish_version_major') }}</span>
              <span class="pf-radio__desc">{{ t('post_orders.publish_version_major_desc') }}</span>
            </span>
            <span class="pf-radio__badge pf-radio__badge--major">v{{ nextVersion }}</span>
          </label>
        </div>
      </div>

      <!-- Change Summary -->
      <div class="pf-field">
        <label class="pf-label">
          {{ t('post_orders.publish_change_summary') }}
          <span class="required">*</span>
        </label>
        <textarea
          v-model="changeSummary"
          class="pf-textarea"
          maxlength="200"
          rows="3"
          :placeholder="t('post_orders.publish_change_summary_placeholder')"
        />
        <span class="pf-count">{{ changeSummary.length }} / 200</span>
      </div>

      <!-- Effective Date -->
      <div class="pf-field">
        <label class="pf-label">
          {{ t('post_orders.publish_effective_date') }}
          <span class="required">*</span>
        </label>
        <input v-model="effectiveDate" type="date" class="pf-input" />
      </div>

      <!-- Notify Officers -->
      <div class="pf-field pf-field--row">
        <div class="pf-field__text">
          <span class="pf-label">{{ t('post_orders.publish_notify_officers') }}</span>
          <span class="pf-hint">{{ t('post_orders.publish_notify_officers_hint') }}</span>
        </div>
        <label class="toggle">
          <input v-model="notifyOfficers" type="checkbox" class="toggle__input" />
          <span class="toggle__track">
            <span class="toggle__thumb" />
          </span>
        </label>
      </div>
    </div>

    <template #footer>
      <button class="btn-secondary" @click="handleClose">
        {{ t('common.cancel') }}
      </button>
      <button class="btn-primary" :disabled="!canSubmit" @click="handleConfirm">
        <Icon name="lucide:send" :size="15" />
        {{ t('post_orders.publish_confirm') }}
      </button>
    </template>
  </AppDialogModal>
</template>

<style scoped>
.publish-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* ── Field ── */
.pf-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.pf-field--row {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.pf-field__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pf-label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
}

.pf-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.required {
  color: var(--color-critical);
  margin-left: 2px;
}

/* ── Radio group ── */
.pf-radio-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.pf-radio {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
}

.pf-radio--active {
  border-color: var(--color-accent);
  background: rgba(var(--color-accent-rgb, 34, 197, 94), 0.06);
}

.pf-radio__input {
  display: none;
}

.pf-radio__box {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  flex-shrink: 0;
  transition: all var(--transition-base);
  position: relative;
}

.pf-radio--active .pf-radio__box {
  border-color: var(--color-accent);
  background: var(--color-accent);
  box-shadow: inset 0 0 0 3px var(--color-bg-elevated);
}

.pf-radio__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pf-radio__title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.pf-radio__desc {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.pf-radio__badge {
  font-size: var(--font-size-xs);
  font-weight: 700;
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  flex-shrink: 0;
}

.pf-radio__badge--major {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

/* ── Inputs ── */
.pf-textarea {
  padding: var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-family: inherit;
  resize: vertical;
  outline: none;
  transition: border-color var(--transition-base);
}

.pf-textarea:focus { border-color: var(--color-accent); }

.pf-count {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-align: right;
}

.pf-input {
  height: 40px;
  padding: 0 var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  outline: none;
  transition: border-color var(--transition-base);
}

.pf-input:focus { border-color: var(--color-accent); }

/* ── Toggle ── */
.toggle { display: inline-flex; align-items: center; gap: var(--space-2); cursor: pointer; }
.toggle__input { display: none; }

.toggle__track {
  position: relative;
  width: 36px;
  height: 20px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  transition: background var(--transition-base);
}

.toggle__input:checked + .toggle__track { background: var(--color-accent); }

.toggle__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: transform var(--transition-base);
}

.toggle__input:checked + .toggle__track .toggle__thumb { transform: translateX(16px); }

/* ── Footer buttons ── */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  height: 38px;
  padding: 0 var(--space-5);
  background: var(--color-accent);
  border: none;
  border-radius: var(--radius-md);
  color: #0a0c10;
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--transition-base);
}

.btn-primary:hover:not(:disabled) { opacity: 0.9; }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-secondary {
  display: inline-flex;
  align-items: center;
  height: 38px;
  padding: 0 var(--space-4);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-secondary:hover { border-color: var(--color-accent); color: var(--color-text-primary); }
</style>
