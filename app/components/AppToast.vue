<script setup lang="ts">
import { useToastStore } from '~/stores/toast'

const toastStore = useToastStore()

function startTimer(id: number, duration: number) {
  setTimeout(() => toastStore.remove(id), duration)
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite" aria-atomic="false">
      <TransitionGroup name="toast" tag="div" class="toast-list">
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          :class="['toast', `toast--${toast.type}`]"
          role="alert"
          @vue:mounted="startTimer(toast.id, toast.duration)"
        >
          <Icon
            :name="toast.type === 'success' ? 'lucide:check-circle-2'
              : toast.type === 'error' ? 'lucide:x-circle'
              : toast.type === 'warning' ? 'lucide:alert-triangle'
              : 'lucide:info'"
            :size="16"
            class="toast__icon"
          />
          <span class="toast__message">{{ toast.message }}</span>
          <button class="toast__close" :aria-label="'Dismiss'" @click="toastStore.remove(toast.id)">
            <Icon name="lucide:x" :size="13" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: var(--space-6, 24px);
  right: var(--space-6, 24px);
  z-index: 9999;
  pointer-events: none;
}

.toast-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 8px);
  align-items: flex-end;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2, 8px);
  padding: var(--space-3, 12px) var(--space-4, 16px);
  border-radius: var(--radius-md, 8px);
  border: 1px solid transparent;
  min-width: 260px;
  max-width: 400px;
  font-size: var(--font-size-sm, 13px);
  line-height: 1.4;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  pointer-events: all;
  background: var(--color-bg-surface);
}

.toast--success {
  border-color: color-mix(in srgb, #22c55e 35%, transparent);
  background: color-mix(in srgb, #22c55e 10%, var(--color-bg-surface));
}

.toast--error {
  border-color: color-mix(in srgb, #ef4444 35%, transparent);
  background: color-mix(in srgb, #ef4444 10%, var(--color-bg-surface));
}

.toast--warning {
  border-color: color-mix(in srgb, #f59e0b 35%, transparent);
  background: color-mix(in srgb, #f59e0b 10%, var(--color-bg-surface));
}

.toast--info {
  border-color: color-mix(in srgb, #3b82f6 35%, transparent);
  background: color-mix(in srgb, #3b82f6 10%, var(--color-bg-surface));
}

.toast__icon {
  flex-shrink: 0;
  margin-top: 1px;
}

.toast--success .toast__icon { color: #22c55e; }
.toast--error   .toast__icon { color: #ef4444; }
.toast--warning .toast__icon { color: #f59e0b; }
.toast--info    .toast__icon { color: #3b82f6; }

.toast__message {
  flex: 1;
  color: var(--color-text-primary);
}

.toast__close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  opacity: 0.6;
  transition: opacity var(--transition-base, 150ms);
  margin-top: 1px;
}

.toast__close:hover { opacity: 1; }

/* Transition animations */
.toast-enter-active,
.toast-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(24px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(24px) scale(0.95);
}
</style>
