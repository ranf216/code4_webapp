<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

export interface SearchableOption {
  value: string
  label: string
}

const props = withDefaults(defineProps<{
  modelValue: string[]
  options: SearchableOption[]
  placeholder?: string
  search?: string
  loading?: boolean
  emptyText?: string
}>(), {
  placeholder: 'Search...',
  search: '',
  loading: false,
  emptyText: 'No results found.',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
  (e: 'update:search', value: string): void
  (e: 'select', value: string): void
  (e: 'remove', value: string): void
  (e: 'focus'): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const triggerRef = ref<HTMLDivElement | null>(null)
const isOpen = ref(false)
const localSearch = ref(props.search)
const dropdownStyle = ref({
  position: 'fixed' as const,
  top: '0px',
  left: '0px',
  width: '0px',
  zIndex: 9999,
})

watch(() => props.search, (val) => {
  localSearch.value = val
})

watch(localSearch, (val) => {
  emit('update:search', val)
})

const selectedSet = computed(() => new Set(props.modelValue))

const selectedOptions = computed(() => {
  return props.modelValue
    .map(v => props.options.find(o => o.value === v))
    .filter((o): o is SearchableOption => !!o)
})

const filteredOptions = computed(() => {
  const term = localSearch.value.trim().toLowerCase()
  return props.options.filter(o => {
    if (selectedSet.value.has(o.value)) return false
    if (!term) return true
    return o.label.toLowerCase().includes(term)
  })
})

function updateDropdownPosition() {
  const trigger = triggerRef.value
  if (!trigger) return
  const rect = trigger.getBoundingClientRect()
  dropdownStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: 9999,
  }
}

function openDropdown() {
  if (isOpen.value) return
  isOpen.value = true
  nextTick(() => {
    updateDropdownPosition()
    inputRef.value?.focus()
    emit('focus')
  })
}

function closeDropdown() {
  isOpen.value = false
}

function toggleDropdown() {
  if (isOpen.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

function selectValue(value: string) {
  if (selectedSet.value.has(value)) return
  const next = [...props.modelValue, value]
  emit('update:modelValue', next)
  emit('select', value)
  localSearch.value = ''
  emit('update:search', '')
  nextTick(() => updateDropdownPosition())
}

function removeValue(value: string) {
  const next = props.modelValue.filter(v => v !== value)
  emit('update:modelValue', next)
  emit('remove', value)
  nextTick(() => updateDropdownPosition())
}

function onInputFocus() {
  openDropdown()
}

function onBlur(event: FocusEvent) {
  const related = event.relatedTarget as HTMLElement | null
  if (related && related.closest('.searchable-multi-select')) {
    return
  }
  isOpen.value = false
}

function onScrollOrResize() {
  if (isOpen.value) {
    updateDropdownPosition()
  }
}

onMounted(() => {
  window.addEventListener('scroll', onScrollOrResize, true)
  window.addEventListener('resize', onScrollOrResize)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScrollOrResize, true)
  window.removeEventListener('resize', onScrollOrResize)
})
</script>

<template>
  <div class="searchable-multi-select" @click.stop>
    <div
      ref="triggerRef"
      class="select-control"
      :class="{ 'select-control--open': isOpen }"
      tabindex="0"
      @focus="onInputFocus"
      @blur="onBlur"
      @click="toggleDropdown"
    >
      <div class="select-control__inner">
        <div v-if="selectedOptions.length" class="selected-chips">
          <span
            v-for="option in selectedOptions"
            :key="option.value"
            class="chip"
          >
            {{ option.label }}
            <button
              type="button"
              class="chip__remove"
              :aria-label="`Remove ${option.label}`"
              @click.stop="removeValue(option.value)"
            >
              <Icon name="lucide:x" :size="12" />
            </button>
          </span>
        </div>
        <input
          ref="inputRef"
          v-model="localSearch"
          type="text"
          class="select-input"
          :placeholder="selectedOptions.length ? '' : placeholder"
          @focus="onInputFocus"
          @blur="onBlur"
          @click.stop
        />
      </div>
      <div class="select-control__actions">
        <Icon
          v-if="loading"
          name="lucide:loader-2"
          :size="16"
          class="spin"
        />
        <Icon
          v-else
          name="lucide:chevron-down"
          :size="16"
          class="select-control__arrow"
          :class="{ 'select-control__arrow--open': isOpen }"
        />
      </div>
    </div>

    <ClientOnly>
      <Teleport to="body">
        <Transition name="dropdown">
          <div
            v-if="isOpen"
            class="select-dropdown select-dropdown--teleport"
            :style="dropdownStyle"
            @click.stop
          >
            <div
              v-if="filteredOptions.length"
              class="select-options"
              role="listbox"
            >
              <button
                v-for="option in filteredOptions"
                :key="option.value"
                type="button"
                class="select-option"
                role="option"
                @click.stop="selectValue(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
            <div v-else-if="loading" class="select-empty">
              Loading...
            </div>
            <div v-else class="select-empty">
              {{ emptyText }}
            </div>
          </div>
        </Transition>
      </Teleport>
    </ClientOnly>
  </div>
</template>

<style scoped>
.searchable-multi-select {
  position: relative;
  width: 100%;
}

.select-control {
  display: flex;
  align-items: center;
  min-height: 44px;
  padding: var(--space-1) var(--space-3);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: text;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
}

.select-control:hover,
.select-control--open {
  border-color: var(--color-accent);
}

.select-control:focus-visible {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px rgba(229, 255, 68, 0.2);
}

.select-control__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  flex: 1 1 auto;
  gap: var(--space-1);
  min-width: 0;
}

.selected-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.chip__remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.chip__remove:hover {
  color: var(--color-text-primary);
}

.select-input {
  flex: 1 1 auto;
  min-width: 80px;
  padding: 0;
  background: transparent;
  border: none;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  outline: none;
}

.select-input::placeholder {
  color: var(--color-text-secondary);
}

.select-control__actions {
  display: flex;
  align-items: center;
  margin-left: var(--space-2);
  color: var(--color-text-secondary);
}

.select-control__arrow {
  transition: transform var(--transition-base);
}

.select-control__arrow--open {
  transform: rotate(180deg);
}

.select-dropdown {
  max-height: 360px;
  overflow-y: auto;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
}

.select-dropdown--teleport {
  position: fixed;
  z-index: 9999;
}

.select-options {
  display: flex;
  flex-direction: column;
  padding: var(--space-2);
  gap: var(--space-1);
}

.select-option {
  width: 100%;
  min-height: 44px;
  padding: var(--space-2) var(--space-3);
  text-align: left;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  line-height: 1.5;
  cursor: pointer;
  transition: background var(--transition-base);
}

.select-option:hover,
.select-option:focus-visible {
  background: var(--color-bg-surface);
  outline: none;
}

.select-empty {
  min-height: 44px;
  padding: var(--space-3);
  text-align: center;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  line-height: 1.5;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity var(--transition-base), transform var(--transition-base);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spin {
  animation: spin 1s linear infinite;
}
</style>
