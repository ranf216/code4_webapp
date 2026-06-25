<script setup lang="ts">
interface BreadcrumbItem {
  label: string
  to?: string
}

const props = defineProps<{
  title: string
  breadcrumb?: BreadcrumbItem[]
  showSearch?: boolean
  searchPlaceholder?: string
  searchModelValue?: string
}>()

const emit = defineEmits<{
  'update:searchModelValue': [value: string]
}>()

const breadcrumbItems = computed(() => props.breadcrumb || [])
const showSearchBox = computed(() => props.showSearch !== false)
const placeholder = computed(() => props.searchPlaceholder || 'Search…')

const searchValue = computed({
  get: () => props.searchModelValue || '',
  set: (val: string) => emit('update:searchModelValue', val),
})

const now = ref('')

function formatDateTime(d: Date) {
  const yyyy = d.getFullYear()
  const mm   = String(d.getMonth() + 1).padStart(2, '0')
  const dd   = String(d.getDate()).padStart(2, '0')
  const hh   = String(d.getHours()).padStart(2, '0')
  const min  = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`
}

onMounted(() => {
  now.value = formatDateTime(new Date())
  const timer = setInterval(() => { now.value = formatDateTime(new Date()) }, 30000)
  onUnmounted(() => clearInterval(timer))
})
</script>

<template>
  <header class="app-header">
    <div class="app-header__left">
      <h1 class="app-header__title">{{ title }}</h1>
      <nav v-if="breadcrumbItems.length" class="app-header__breadcrumb">
        <template v-for="(item, index) in breadcrumbItems" :key="index">
          <NuxtLink v-if="item.to" :to="item.to" class="app-header__breadcrumb-link">
            {{ item.label }}
          </NuxtLink>
          <span v-else class="app-header__breadcrumb-text">{{ item.label }}</span>
          <Icon v-if="index < breadcrumbItems.length - 1" name="lucide:chevron-right" :size="12" />
        </template>
      </nav>
    </div>

    <div class="app-header__right">
      <div v-if="showSearchBox" class="app-header__search">
        <Icon name="lucide:search" :size="14" class="app-header__search-icon" />
        <input
          v-model="searchValue"
          class="app-header__search-input"
          type="text"
          :placeholder="placeholder"
        />
        <span class="app-header__search-kbd">⌘K</span>
      </div>

      <button class="app-header__icon-btn">
        <Icon name="lucide:bell" :size="18" />
        <span class="app-header__notif-dot" />
      </button>

      <span class="app-header__datetime">{{ now }}</span>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: 0 var(--space-6);
  height: 52px;
  background: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.app-header__left {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
}

.app-header__title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.app-header__breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  opacity: 0.7;
}

.app-header__breadcrumb-link {
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color var(--transition-base);
}

.app-header__breadcrumb-link:hover {
  color: var(--color-accent);
}

.app-header__breadcrumb-text {
  color: var(--color-text-muted);
}

.app-header__right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.app-header__search {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  margin: var(--space-1);
  padding: var(--space-1) var(--space-2);
}

.app-header__search-icon {
  color: var(--color-text-muted);
  pointer-events: none;
}

.app-header__search-input {
  background: none;
  border: none;
  outline: none;
  padding: 2px 6px;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  width: 220px;
  font-family: var(--font-family);
}

.app-header__search-input::placeholder {
  color: white;
}

.app-header__search-input:focus {
  border-color: var(--color-accent);
}

.app-header__search-kbd {
  font-size: 10px;
  color: var(--color-text-muted);
  background: var(--color-bg-overlay);
  border: 1px solid var(--color-border);
  border-radius: 3px;
  padding: 1px 4px;
}

.app-header__icon-btn {
  position: relative;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-base);
}

.app-header__icon-btn:hover {
  background: var(--color-bg-overlay);
  color: var(--color-text-primary);
}

.app-header__notif-dot {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 7px;
  height: 7px;
  background: var(--color-critical);
  border-radius: 50%;
  border: 1px solid var(--color-bg-surface);
}

.app-header__datetime {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  font-weight: 600;
  white-space: nowrap;
  border: solid 1px var(--color-border);
  border-radius: var(--radius-md);
  padding: 4px 12px;
  background: var(--color-bg-elevated);
}
</style>
