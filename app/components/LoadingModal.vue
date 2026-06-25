<script setup lang="ts">
interface Props {
  show: boolean
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  message: 'Loading...',
})
</script>

<template>
  <Teleport to="body">
    <Transition name="loading-modal">
      <div v-if="show" class="loading-modal-overlay">
        <div class="loading-modal">
          <div class="loading-modal__spinner">
            <Icon name="lucide:loader-circle" :size="48" class="spin" />
          </div>
          <p v-if="message" class="loading-modal__message">{{ message }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.loading-modal-overlay {
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
  z-index: 9999;
}

.loading-modal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-8);
  background: var(--color-bg-elevated);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  min-width: 200px;
}

.loading-modal__spinner {
  color: var(--color-accent);
}

.loading-modal__message {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  text-align: center;
  font-weight: 500;
}

/* Animations */
.loading-modal-enter-active,
.loading-modal-leave-active {
  transition: all 0.3s ease;
}

.loading-modal-enter-from,
.loading-modal-leave-to {
  opacity: 0;
}

.loading-modal-enter-active .loading-modal,
.loading-modal-leave-active .loading-modal {
  transition: all 0.3s ease;
}

.loading-modal-enter-from .loading-modal,
.loading-modal-leave-to .loading-modal {
  transform: scale(0.9);
  opacity: 0;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
