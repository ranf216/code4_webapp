<script lang="ts">
export interface SegmentedControlOption {
  label: string
  value: string
  disabled?: boolean
}

export default {
  props: {
    modelValue: { type: String, required: true },
    options: { type: Array as () => SegmentedControlOption[], required: true },
    ariaLabel: { type: String, default: 'Options' },
  },
  emits: ['update:modelValue', 'change'],
  setup(props: { modelValue: string }, { emit }: { emit: (event: string, value: string) => void }) {
    function selectOption(option: SegmentedControlOption) {
      if (option.disabled || props.modelValue === option.value) return
      emit('update:modelValue', option.value)
      emit('change', option.value)
    }
    return { selectOption }
  },
}
</script>

<template>
  <div class="segmented-control" role="radiogroup" :aria-label="ariaLabel">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="segmented-control__option"
      :class="{ 'segmented-control__option--selected': modelValue === option.value }"
      :disabled="option.disabled"
      role="radio"
      :aria-checked="modelValue === option.value"
      @click="selectOption(option)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.segmented-control {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(54px, 1fr);
  align-items: center;
  height: 38px;
  padding: 4px;
  box-sizing: border-box;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.segmented-control__option {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  margin: 0;
  padding: 0 var(--space-3);
  box-sizing: border-box;
  background: transparent;
  border: 0;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font: inherit;
  font-size: var(--font-size-xs);
  line-height: 1;
  cursor: pointer;
  transition: background var(--transition-base), color var(--transition-base);
}

.segmented-control__option--selected {
  background: var(--color-accent);
  color: var(--color-bg-base);
  font-weight: 500;
}

.segmented-control__option:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
