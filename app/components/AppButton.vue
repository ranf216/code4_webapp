<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  text: string
  icon?: string
  type?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  iconOnly?: boolean
}>(), {
  type: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  iconOnly: false,
})

const emit = defineEmits<{
  (e: 'click'): void
}>()

function handleClick() {
  if (!props.disabled && !props.loading) {
    emit('click')
  }
}

const iconSize = computed(() => {
  if (props.size === 'sm') return 14
  if (props.size === 'lg') return 20
  return 16
})
</script>

<template>
  <button
    class="app-button"
    :class="[
      `app-button--${type}`,
      `app-button--${size}`,
      { 'app-button--icon-only': iconOnly },
      { 'app-button--loading': loading },
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <Icon
      v-if="loading"
      name="lucide:loader-2"
      :size="iconSize"
      class="spin"
    />
    <Icon
      v-else-if="icon"
      :name="icon"
      :size="iconSize"
    />
    <span v-if="!iconOnly">{{ text }}</span>
  </button>
</template>

<style scoped>
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
}

.app-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Sizes */
.app-button--sm {
  height: 32px;
  padding: 0 var(--space-3);
  font-size: var(--font-size-xs);
}

.app-button--md {
  height: 40px;
  padding: 0 var(--space-4);
  font-size: var(--font-size-sm);
}

.app-button--lg {
  height: 48px;
  padding: 0 var(--space-5);
  font-size: var(--font-size-base);
}

/* Types */
.app-button--primary {
  background: var(--color-accent);
  color: #0a0c10;
}

.app-button--primary:hover:not(:disabled) {
  opacity: 0.9;
}

.app-button--secondary {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

.app-button--secondary:hover:not(:disabled) {
  background: var(--color-bg-overlay);
  border-color: var(--color-accent);
}

.app-button--danger {
  background: var(--color-critical);
  color: white;
}

.app-button--danger:hover:not(:disabled) {
  opacity: 0.9;
}

.app-button--ghost {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}

.app-button--ghost:hover:not(:disabled) {
  background: var(--color-bg-overlay);
  color: var(--color-text-primary);
}

.app-button--icon-only {
  padding: 0;
  width: v-bind('size === "sm" ? "28px" : size === "lg" ? "48px" : "40px"');
}

.app-button--loading {
  cursor: wait;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
