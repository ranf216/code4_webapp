<script setup lang="ts">
import { useTranslation } from '~/composables/useI18n'

export interface SectionData {
  id: string
  type: string
  title: string
  description: string
  clientVisible: boolean
  notes: string
  attachments: string[]
}

export interface SectionTypeOption {
  type_id: string
  name: string
  client_visible: boolean
}

const props = defineProps<{
  modelValue: SectionData
  index: number
  total: number
  sectionTypes: SectionTypeOption[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: SectionData]
  'move-up': []
  'move-down': []
  'remove': []
}>()

const { t } = useTranslation()

const collapsed = ref(false)

function update<K extends keyof SectionData>(key: K, value: SectionData[K]) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function onTypeChange(event: Event) {
  const newType = (event.target as HTMLSelectElement).value
  const matched = props.sectionTypes.find((st) => st.name === newType)
  emit('update:modelValue', {
    ...props.modelValue,
    type: newType,
    title: newType,
    clientVisible: matched ? matched.client_visible : props.modelValue.clientVisible,
  })
}

function onInputTitle(event: Event) {
  update('title', (event.target as HTMLInputElement).value)
}

function onToggleClientVisible(event: Event) {
  update('clientVisible', (event.target as HTMLInputElement).checked)
}

function onInputDescription(event: Event) {
  update('description', (event.target as HTMLTextAreaElement).value)
}

function onInputNotes(event: Event) {
  update('notes', (event.target as HTMLTextAreaElement).value)
}
</script>

<template>
  <div class="form-card section-card" :class="{ 'section-card--collapsed': collapsed }">
    <div class="form-card__header" @click="collapsed = !collapsed">
      <Icon name="lucide:layers" :size="18" />
      <h3 class="form-card__title">
        <span class="section-card__index">{{ t('post_orders.section_label', { n: String(index + 1) }) }}</span>
        <span v-if="modelValue.title" class="section-card__title-text">— {{ modelValue.title }}</span>
      </h3>
      <div class="section-card__controls" @click.stop>
        <button
          class="icon-btn"
          :disabled="index === 0"
          :title="t('post_orders.move_up')"
          @click="emit('move-up')"
        >
          <Icon name="lucide:chevron-up" :size="15" />
        </button>
        <button
          class="icon-btn"
          :disabled="index === total - 1"
          :title="t('post_orders.move_down')"
          @click="emit('move-down')"
        >
          <Icon name="lucide:chevron-down" :size="15" />
        </button>
        <button
          class="icon-btn icon-btn--danger"
          :disabled="total === 1"
          :title="t('post_orders.remove_section')"
          @click="emit('remove')"
        >
          <Icon name="lucide:trash-2" :size="15" />
        </button>
        <div class="toolbar-sep" />
        <button class="icon-btn" :title="collapsed ? 'Expand' : 'Collapse'" @click="collapsed = !collapsed">
          <Icon :name="collapsed ? 'lucide:chevron-down' : 'lucide:chevron-up'" :size="15" />
        </button>
      </div>
    </div>

    <div v-show="!collapsed" class="section-grid">
      <!-- Section Type -->
      <div class="field">
        <label class="field__label">
          {{ t('post_orders.field_section_type') }}
          <span class="required">*</span>
        </label>
        <select
          :value="modelValue.type"
          class="field__select"
          @change="onTypeChange($event)"
        >
          <option v-for="st in sectionTypes" :key="st.type_id" :value="st.name">
            {{ st.name }}
          </option>
        </select>
      </div>

      <!-- Section Title -->
      <div class="field">
        <label class="field__label">
          {{ t('post_orders.field_section_title') }}
          <span class="required">*</span>
        </label>
        <input
          :value="modelValue.title"
          type="text"
          class="field__input"
          maxlength="80"
          :placeholder="t('post_orders.field_section_title_placeholder')"
          @input="onInputTitle($event)"
        />
      </div>

      <!-- Client Visible Toggle -->
      <div class="field field--toggle">
        <label class="field__label">{{ t('post_orders.field_client_visible') }}</label>
        <label class="toggle">
          <input
            :checked="modelValue.clientVisible"
            type="checkbox"
            class="toggle__input"
            @change="onToggleClientVisible($event)"
          />
          <span class="toggle__track">
            <span class="toggle__thumb" />
          </span>
          <span class="toggle__label">
            {{ modelValue.clientVisible ? t('common.yes') : t('common.no') }}
          </span>
        </label>
      </div>

      <!-- Description -->
      <div class="field field--full">
        <label class="field__label">
          {{ t('post_orders.field_description') }}
          <span class="required">*</span>
        </label>
        <div class="rich-editor">
          <div class="rich-editor__toolbar">
            <button type="button" class="toolbar-btn" title="Bold"><Icon name="lucide:bold" :size="14" /></button>
            <button type="button" class="toolbar-btn" title="Italic"><Icon name="lucide:italic" :size="14" /></button>
            <button type="button" class="toolbar-btn" title="Underline"><Icon name="lucide:underline" :size="14" /></button>
            <div class="toolbar-sep" />
            <button type="button" class="toolbar-btn" title="Bullet List"><Icon name="lucide:list" :size="14" /></button>
            <button type="button" class="toolbar-btn" title="Numbered List"><Icon name="lucide:list-ordered" :size="14" /></button>
            <div class="toolbar-sep" />
            <button type="button" class="toolbar-btn" title="Link"><Icon name="lucide:link" :size="14" /></button>
          </div>
          <textarea
            :value="modelValue.description"
            class="rich-editor__textarea"
            maxlength="10000"
            :placeholder="t('post_orders.field_description_placeholder')"
            rows="6"
            @input="onInputDescription($event)"
          />
          <div class="rich-editor__count">{{ modelValue.description.length }} / 10,000</div>
        </div>
      </div>

      <!-- Attachments -->
      <div class="field field--full">
        <FileUpload
          :model-value="modelValue.attachments"
          accept=".pdf,.jpg,.jpeg,.png,.mp4"
          :max-files="5"
          :max-size-mb="20"
          :call-api="false"
          :label="t('post_orders.field_attachments')"
          :hint="t('post_orders.field_attachments_hint')"
          @update:model-value="update('attachments', $event)"
        />
      </div>

      <!-- Internal Notes -->
      <div class="field field--full">
        <label class="field__label">{{ t('post_orders.field_notes') }}</label>
        <textarea
          :value="modelValue.notes"
          class="field__textarea"
          maxlength="2000"
          :placeholder="t('post_orders.field_notes_placeholder')"
          rows="3"
          @input="onInputNotes($event)"
        />
        <div class="field__count">{{ modelValue.notes.length }} / 2,000</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.form-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  user-select: none;
}

.section-card--collapsed .form-card__header {
  border-bottom: none;
}

.section-card__title-text {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-left: var(--space-1);
}

.form-card__title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  flex: 1;
}

.section-card__controls {
  display: flex;
  gap: var(--space-1);
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-base);
}

.icon-btn:hover:not(:disabled) { border-color: var(--color-accent); color: var(--color-accent); }
.icon-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.icon-btn--danger:hover:not(:disabled) { border-color: var(--color-critical); color: var(--color-critical); }

.section-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4) var(--space-5);
  padding: var(--space-5);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.field--full { grid-column: 1 / -1; }
.field--toggle { flex-direction: column; gap: var(--space-2); }

.field__label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
}

.required { color: var(--color-critical); margin-left: 2px; }

.field__input,
.field__select {
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

.field__input:focus,
.field__select:focus { border-color: var(--color-accent); }

.field__textarea {
  padding: var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-family: inherit;
  outline: none;
  resize: vertical;
  transition: border-color var(--transition-base);
}

.field__textarea:focus { border-color: var(--color-accent); }

.field__count {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-align: right;
}

/* Toggle */
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

.toggle__label { font-size: var(--font-size-sm); color: var(--color-text-secondary); }

/* Rich Editor */
.rich-editor {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: border-color var(--transition-base);
}

.rich-editor:focus-within { border-color: var(--color-accent); }

.rich-editor__toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-base);
}

.toolbar-btn:hover { background: var(--color-bg-overlay); color: var(--color-text-primary); }

.toolbar-sep { width: 1px; height: 18px; background: var(--color-border); margin: 0 var(--space-1); }

.rich-editor__textarea {
  width: 100%;
  padding: var(--space-3);
  background: var(--color-bg-base);
  border: none;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-family: inherit;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
}

.rich-editor__count {
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-elevated);
  border-top: 1px solid var(--color-border);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-align: right;
}
</style>
