<script setup lang="ts">
const props = withDefaults(defineProps<{
  show: boolean
  title: string
  maxWidth?: string
}>(), {
  maxWidth: '600px',
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

watch(() => props.show, (newVal: boolean) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="dialog-modal-backdrop" @click="handleBackdropClick">
        <div class="dialog-modal" :style="{ maxWidth: props.maxWidth }">
          <!-- Header -->
          <div class="dialog-modal__header">
            <h3 class="dialog-modal__title">{{ title }}</h3>
            <button class="dialog-modal__close" @click="$emit('close')">
              <Icon name="lucide:x" :size="20" />
            </button>
          </div>

          <!-- Body -->
          <div class="dialog-modal__body">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="dialog-modal__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
}

.dialog-modal {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.dialog-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-border);
}

.dialog-modal__title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin: 0;
  color: var(--color-text-primary);
}

.dialog-modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.dialog-modal__close:hover {
  background: var(--color-bg-overlay);
  color: var(--color-text-primary);
}

.dialog-modal__body {
  padding: var(--space-6);
}

.dialog-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border);
}

/* Transition animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-active .dialog-modal,
.modal-fade-leave-active .dialog-modal {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .dialog-modal,
.modal-fade-leave-to .dialog-modal {
  transform: translateY(-20px) scale(0.98);
  opacity: 0;
}

.modal-fade-enter-to .dialog-modal,
.modal-fade-leave-from .dialog-modal {
  transform: translateY(0) scale(1);
  opacity: 1;
}

@media (max-width: 640px) {
  .dialog-modal {
    max-width: 100%;
  }

  .dialog-modal__footer {
    flex-direction: column-reverse;
  }

  .dialog-modal__footer :deep(.app-button) {
    width: 100%;
  }
}
</style>
