<script setup lang="ts">
import { useNotificationBadge } from '~/composables/useNotificationBadge'
import { callApi } from '~/api/call'
import { residentApi } from '~/api/resident'
import { officerApi } from '~/api/officer'
import { assetApi } from '~/api/asset'
import type { Call } from '~/api/types/call'
import type { Resident } from '~/api/types/resident'
import type { Officer } from '~/api/types/officer'
import type { Post } from '~/api/types/asset'

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

interface GlobalSearchResult {
  id: string
  type: 'call' | 'resident' | 'officer' | 'post'
  title: string
  subtitle: string
  to: string
}

const { badgeText, showBadge } = useNotificationBadge()
const router = useRouter()
const searchRef = ref<HTMLElement | null>(null)
const searchValue = ref(props.searchModelValue || '')
const searchResults = ref<GlobalSearchResult[]>([])
const isSearching = ref(false)
const searchOpen = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | null = null
let searchRequestId = 0

const breadcrumbItems = computed(() => props.breadcrumb || [])
const showSearchBox = computed(() => props.showSearch !== false)
const placeholder = computed(() => props.searchPlaceholder || 'Search calls, residents, officers and posts...')
const groupedSearchResults = computed(() => {
  const groups = [
    { type: 'call', label: 'Calls' },
    { type: 'resident', label: 'Residents' },
    { type: 'officer', label: 'Officers' },
    { type: 'post', label: 'Posts' },
  ] as const
  return groups.map(group => ({
    ...group,
    results: searchResults.value.filter((result: GlobalSearchResult) => result.type === group.type),
  })).filter(group => group.results.length)
})

watch(() => props.searchModelValue, (value: string | undefined) => {
  if (value !== undefined && value !== searchValue.value) searchValue.value = value
})

watch(searchValue, (value: string) => {
  emit('update:searchModelValue', value)
  if (searchTimer) clearTimeout(searchTimer)
  const query = value.trim()
  if (!query) {
    searchRequestId++
    searchResults.value = []
    isSearching.value = false
    searchOpen.value = false
    return
  }
  searchOpen.value = true
  isSearching.value = true
  const requestId = ++searchRequestId
  searchTimer = setTimeout(() => performGlobalSearch(query, requestId), 2000)
})

async function performGlobalSearch(query: string, requestId: number) {
  const responses = await Promise.allSettled([
    callApi.getCalls({ search_text: query, offset: 0, limit: 5 }, { showLoading: false }),
    residentApi.getResidents({ search_text: query, include_inactive: true }, { showLoading: false }),
    officerApi.getOfficers({ search_text: query, include_inactive: true }, { showLoading: false }),
    assetApi.getPostsList({ community_id: 0, search_text: query, include_inactive: true, page: 0 }, { showLoading: false }),
  ])
  if (requestId !== searchRequestId) return

  const [callsResponse, residentsResponse, officersResponse, postsResponse] = responses
  const calls: Call[] = callsResponse.status === 'fulfilled' ? callsResponse.value.calls || [] : []
  const residents: Resident[] = residentsResponse.status === 'fulfilled' ? residentsResponse.value.residents || [] : []
  const officers: Officer[] = officersResponse.status === 'fulfilled' ? officersResponse.value.officers || [] : []
  const posts: Post[] = postsResponse.status === 'fulfilled' ? postsResponse.value.posts || [] : []

  searchResults.value = [
    ...calls.slice(0, 5).map(call => ({
      id: String(call.call_id),
      type: 'call' as const,
      title: `Call #${call.call_id} — ${call.description || call.service_type || call.category}`,
      subtitle: [call.community_name, call.status].filter(Boolean).join(' · '),
      to: `/calls?search=${encodeURIComponent(query)}&call_id=${call.call_id}`,
    })),
    ...residents.slice(0, 5).map(resident => ({
      id: resident.user_id,
      type: 'resident' as const,
      title: `${resident.first_name} ${resident.last_name}`.trim(),
      subtitle: [resident.community_name, resident.email || resident.phone_num].filter(Boolean).join(' · '),
      to: `/communities/${resident.community_id}/residents?search=${encodeURIComponent(query)}&resident_id=${resident.user_id}`,
    })),
    ...officers.slice(0, 5).map(officer => ({
      id: officer.user_id,
      type: 'officer' as const,
      title: `${officer.first_name} ${officer.last_name}`.trim(),
      subtitle: [officer.community_name, officer.title].filter(Boolean).join(' · '),
      to: `/officers?search=${encodeURIComponent(query)}&officer_id=${officer.user_id}`,
    })),
    ...posts.slice(0, 5).map(post => ({
      id: String(post.post_id),
      type: 'post' as const,
      title: post.name,
      subtitle: [post.community_name, post.priority].filter(Boolean).join(' · '),
      to: `/map-management?search=${encodeURIComponent(query)}&community_id=${post.community_id}&post_id=${post.post_id}`,
    })),
  ]
  isSearching.value = false
}

function clearSearch() {
  searchValue.value = ''
}

async function selectSearchResult(result: GlobalSearchResult) {
  searchOpen.value = false
  await router.push(result.to)
}

function handleSearchOutside(event: MouseEvent) {
  if (searchRef.value && !searchRef.value.contains(event.target as Node)) searchOpen.value = false
}

const now = ref('')

function formatDateTime(d: Date) {
  const yyyy = d.getFullYear()
  const mm   = String(d.getMonth() + 1).padStart(2, '0')
  const dd   = String(d.getDate()).padStart(2, '0')
  const hh   = String(d.getHours()).padStart(2, '0')
  const min  = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`
}

let clockTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  now.value = formatDateTime(new Date())
  clockTimer = setInterval(() => { now.value = formatDateTime(new Date()) }, 30000)
  document.addEventListener('click', handleSearchOutside)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
  if (searchTimer) clearTimeout(searchTimer)
  document.removeEventListener('click', handleSearchOutside)
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
      <div v-if="showSearchBox" ref="searchRef" class="app-header__search-wrap">
        <div class="app-header__search">
          <Icon name="lucide:search" :size="14" class="app-header__search-icon" />
          <input
            v-model="searchValue"
            class="app-header__search-input"
            type="text"
            :placeholder="placeholder"
            @focus="searchOpen = !!searchValue.trim()"
          />
          <button v-if="searchValue" class="app-header__search-clear" aria-label="Clear search" @click="clearSearch">
            <Icon name="lucide:x" :size="14" />
          </button>
          <span v-else class="app-header__search-kbd">⌘K</span>
        </div>

        <div v-if="searchOpen" class="app-header__search-results">
          <div v-if="isSearching" class="app-header__search-state">
            <Icon name="lucide:loader-circle" :size="16" class="app-header__search-spinner" />
            Searching after you finish typing...
          </div>
          <template v-else-if="groupedSearchResults.length">
            <section v-for="group in groupedSearchResults" :key="group.type" class="app-header__search-group">
              <div class="app-header__search-group-title">{{ group.label }}</div>
              <button
                v-for="result in group.results"
                :key="`${result.type}-${result.id}`"
                class="app-header__search-result"
                @click="selectSearchResult(result)"
              >
                <span class="app-header__search-result-title">{{ result.title }}</span>
                <span class="app-header__search-result-subtitle">{{ result.subtitle }}</span>
              </button>
            </section>
          </template>
          <div v-else class="app-header__search-state">No results found for “{{ searchValue.trim() }}”.</div>
        </div>
      </div>

      <NotificationDropdown v-slot="{ toggle }">
        <button class="app-header__icon-btn" aria-label="Notifications" @click.stop="toggle">
          <Icon name="lucide:bell" :size="18" />
          <span v-if="showBadge" class="app-header__notif-badge">{{ badgeText }}</span>
        </button>
      </NotificationDropdown>

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

.app-header__search-wrap {
  position: relative;
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
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  background: var(--color-bg-overlay);
  border: 1px solid var(--color-border);
  border-radius: 3px;
  padding: 1px 4px;
}

.app-header__search-clear {
  display: flex;
  padding: 2px;
  color: var(--color-text-muted);
  background: transparent;
  border: 0;
  cursor: pointer;
}

.app-header__search-results {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 1100;
  width: 420px;
  max-height: min(560px, calc(100vh - 80px));
  overflow-y: auto;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
}

.app-header__search-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 72px;
  padding: var(--space-4);
  color: #fff;
  font-size: var(--font-size-sm);
  text-align: center;
}

.app-header__search-spinner {
  animation: search-spin 0.8s linear infinite;
}

@keyframes search-spin {
  to { transform: rotate(360deg); }
}

.app-header__search-group + .app-header__search-group {
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}

.app-header__search-group-title {
  padding: var(--space-2) var(--space-3) var(--space-1);
  color: #fff;
  font-size: var(--font-size-base);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.app-header__search-result {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 100%;
  padding: var(--space-1) var(--space-3) var(--space-2) calc(var(--space-3) + 12px);
  color: #fff;
  text-align: left;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.app-header__search-result:hover {
  background: var(--color-bg-overlay);
}

.app-header__search-result-title,
.app-header__search-result-subtitle {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-header__search-result-title {
  font-size: var(--font-size-base);
  font-weight: 600;
}

.app-header__search-result-subtitle {
  color: #fff;
  font-size: var(--font-size-sm);
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

.app-header__notif-badge {
  position: absolute;
  top: 2px;
  right: 0px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: var(--color-critical, #ef4444);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
  border-radius: 8px;
  border: 1.5px solid var(--color-bg-surface);
  pointer-events: none;
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
