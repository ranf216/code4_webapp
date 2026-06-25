<script setup lang="ts">
const props = withDefaults(defineProps<{
  show: boolean
  title: string
  description?: string
  inputLabel?: string
  inputPlaceholder?: string
  submitText?: string
  cancelText?: string
  submitDisabled?: boolean
}>(), {
  description: '',
  inputLabel: '',
  inputPlaceholder: 'Enter value...',
  submitText: 'Add',
  cancelText: 'Cancel',
  submitDisabled: false,
})

const modelValue = defineModel<string>({ default: '' })

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'cancel'): void
  (e: 'submit'): void
}>()

function handleClose() {
  emit('close')
}

function handleCancel() {
  emit('cancel')
}

function handleSubmit() {
  if (props.submitDisabled) return
  emit('submit')
}

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    handleClose()
  }
}

const inputRef = ref<HTMLInputElement | null>(null)

watch(() => props.show, (newVal) => {
  if (newVal) {
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="form-modal-backdrop" @click="handleBackdropClick">
        <div class="form-modal">
          <!-- Header -->
          <div class="form-modal__header">
            <div>
              <h3 class="form-modal__title">{{ title }}</h3>
              <p v-if="description" class="form-modal__description">{{ description }}</p>
            </div>
            <button class="form-modal__close" @click="handleClose">
              <Icon name="lucide:x" :size="20" />
            </button>
          </div>

          <!-- Body -->
          <div class="form-modal__body">
            <div class="form-modal__field">
              <label v-if="inputLabel" class="form-modal__label">{{ inputLabel }}</label>
              <input
                ref="inputRef"
                v-model="modelValue"
                type="text"
                class="form-modal__input"
                :placeholder="inputPlaceholder"
                @keyup.enter="handleSubmit"
              />
            </div>
          </div>

          <!-- Footer -->
          <div class="form-modal__footer">
            <AppButton
              :text="cancelText"
              type="ghost"
              @click="handleCancel"
            />
            <AppButton
              :text="submitText"
              type="primary"
              :disabled="submitDisabled"
              @click="handleSubmit"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.form-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
}

.form-modal {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  min-width: 420px;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.form-modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-5);
  border-bottom: 1px solid var(--color-border);
}

.form-modal__title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-1);
}

.form-modal__description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

.form-modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: color 0.2s ease;
  flex-shrink: 0;
}

.form-modal__close:hover {
  color: var(--color-text-primary);
}

.form-modal__body {
  padding: var(--space-5);
}

.form-modal__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-modal__label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-primary);
}

.form-modal__input {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  width: 100%;
  transition: border-color 0.2s ease;
}

.form-modal__input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.form-modal__input::placeholder {
  color: var(--color-text-muted);
}

.form-modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--color-border);
}

/* Transition animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-active .form-modal,
.modal-fade-leave-active .form-modal {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .form-modal,
.modal-fade-leave-to .form-modal {
  transform: translateY(-20px) scale(0.98);
  opacity: 0;
}

.modal-fade-enter-to .form-modal,
.modal-fade-leave-from .form-modal {
  transform: translateY(0) scale(1);
  opacity: 1;
}

@media (max-width: 640px) {
  .form-modal {
    min-width: unset;
    max-width: 100%;
  }

  .form-modal__footer {
    flex-direction: column-reverse;
  }
}
</style>
