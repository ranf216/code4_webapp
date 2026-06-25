<script setup lang="ts">
const props = withDefaults(defineProps<{
  show: boolean
  title?: string
  message?: string
  cancelText?: string
  okText?: string
  maxWidth?: string
}>(), {
  title: '',
  message: '',
  cancelText: 'Cancel',
  okText: 'OK',
  maxWidth: '500px',
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'cancel'): void
  (e: 'ok'): void
}>()

function handleClose() {
  emit('close')
}

function handleCancel() {
  emit('cancel')
}

function handleOk() {
  emit('ok')
}

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    handleClose()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="modal-backdrop" @click="handleBackdropClick">
        <div class="modal" :style="{ maxWidth: maxWidth }">
          <!-- Header -->
          <div class="modal__header">
            <h3 v-if="title" class="modal__title">{{ title }}</h3>
            <button class="modal__close" @click="handleClose">
              <Icon name="lucide:circle-x" :size="24" />
            </button>
          </div>

          <!-- Body -->
          <div class="modal__body">
            <slot>
              <p v-if="message" class="modal__message">{{ message }}</p>
            </slot>
          </div>

          <!-- Footer - only show if has button text -->
          <div v-if="cancelText || okText" class="modal__footer">
            <button v-if="cancelText" class="modal__btn modal__btn--secondary" @click="handleCancel">
              {{ cancelText }}
            </button>
            <button v-if="okText" class="modal__btn modal__btn--primary" @click="handleOk">
              {{ okText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
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

.modal {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  min-width: 400px;
  max-width: v-bind(maxWidth);
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border);
}

.modal__title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.modal__close {
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
  transition: color var(--transition-base);
}

.modal__close:hover {
  color: var(--color-text-primary);
}

.modal__body {
  padding: var(--space-5);
}

.modal__message {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.6;
}

.modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--color-border);
}

.modal__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 var(--space-5);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
}

.modal__btn--secondary {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

.modal__btn--secondary:hover {
  background: var(--color-bg-overlay);
  border-color: var(--color-accent);
}

.modal__btn--primary {
  background: var(--color-accent);
  border: none;
  color: #0a0c10;
}

.modal__btn--primary:hover {
  opacity: 0.9;
}

/* Transition animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity var(--transition-base);
}

.modal-fade-enter-active .modal,
.modal-fade-leave-active .modal {
  transition: transform var(--transition-base), opacity var(--transition-base);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal,
.modal-fade-leave-to .modal {
  transform: translateY(-20px) scale(0.98);
  opacity: 0;
}

.modal-fade-enter-to,
.modal-fade-leave-from {
  opacity: 1;
}

.modal-fade-enter-to .modal,
.modal-fade-leave-from .modal {
  transform: translateY(0) scale(1);
  opacity: 1;
}

@media (max-width: 640px) {
  .modal {
    min-width: unset;
    max-width: 100%;
  }
  
  .modal__footer {
    flex-direction: column-reverse;
  }
  
  .modal__btn {
    width: 100%;
  }
}
</style>
