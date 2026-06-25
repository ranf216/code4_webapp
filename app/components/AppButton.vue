<script setup lang="ts">
const props = withDefaults(defineProps<{
  text: string
  icon?: string
  type?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}>(), {
  type: 'primary',
  size: 'md',
  disabled: false,
})

const emit = defineEmits<{
  (e: 'click'): void
}>()

function handleClick() {
  if (!props.disabled) {
    emit('click')
  }
}
</script>

<template>
  <button
    class="app-button"
    :class="[`app-button--${type}`, `app-button--${size}`]"
    :disabled="disabled"
    @click="handleClick"
  >
    <Icon v-if="icon" :name="icon" :size="size === 'sm' ? 14 : size === 'lg' ? 20 : 16" />
    <span>{{ text }}</span>
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
</style>
