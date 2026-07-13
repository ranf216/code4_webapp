<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { officerApi } from '~/api/officer'

interface PickerOfficer {
  id: string
  fullName: string
  title: string
  picture: string
  active: boolean
  communityName: string | null
}

const props = defineProps<{
  show: boolean
  preselectedIds?: string[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', officers: PickerOfficer[]): void
}>()

const { t } = useTranslation()

const allOfficers = ref<PickerOfficer[]>([])
const isLoading = ref(false)
const searchQuery = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')
const selectedIds = ref<Set<string>>(new Set())
const isConfirming = ref(false)

const filteredOfficers = computed(() => {
  let list = allOfficers.value
  if (statusFilter.value === 'active') list = list.filter((o) => o.active)
  else if (statusFilter.value === 'inactive') list = list.filter((o) => !o.active)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((o) => o.fullName.toLowerCase().includes(q))
  }
  return list
})

function getInitials(name: string): string {
  return name.split(' ').map((p) => p[0] || '').join('').toUpperCase().slice(0, 2)
}

function toggle(id: string) {
  const s = new Set(selectedIds.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  selectedIds.value = s
}

function handleConfirm() {
  const result = allOfficers.value.filter((o) => selectedIds.value.has(o.id))
  emit('confirm', result)
}

async function loadOfficers() {
  if (allOfficers.value.length) return
  isLoading.value = true
  try {
    const response = await officerApi.getOfficers({ include_inactive: true })
    if (response.rc === 0 && response.officers) {
      allOfficers.value = response.officers.map((o: any) => ({
        id: o.user_id,
        fullName: [o.first_name, o.last_name].filter(Boolean).join(' '),
        title: o.title || '',
        picture: o.image_url || '',
        active: o.is_active,
        communityName: o.community_name || null,
      }))
    }
  } catch (err) {
    console.error('Error loading officers:', err)
  } finally {
    isLoading.value = false
  }
}

watch(() => props.show, (val) => {
  if (val) {
    searchQuery.value = ''
    statusFilter.value = 'all'
    selectedIds.value = new Set(props.preselectedIds || [])
    loadOfficers()
  }
})
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="opm-backdrop" @click.self="$emit('close')">
      <div class="opm-modal">
        <div class="opm-header">
          <h3 class="opm-title">{{ t('communities.add_officers') }}</h3>
          <button type="button" class="opm-close" @click="$emit('close')">
            <Icon name="lucide:x" :size="18" />
          </button>
        </div>

        <div class="opm-filters">
          <div class="opm-search">
            <Icon name="lucide:search" :size="15" class="opm-search-icon" />
            <input
              v-model="searchQuery"
              type="text"
              class="opm-search-input"
              :placeholder="t('common.search') + '…'"
            />
          </div>
          <div class="opm-status-tabs">
            <button type="button" :class="['opm-tab', { 'opm-tab--active': statusFilter === 'all' }]" @click="statusFilter = 'all'">{{ t('common.all') }}</button>
            <button type="button" :class="['opm-tab', { 'opm-tab--active': statusFilter === 'active' }]" @click="statusFilter = 'active'">{{ t('common.active') }}</button>
            <button type="button" :class="['opm-tab', { 'opm-tab--active': statusFilter === 'inactive' }]" @click="statusFilter = 'inactive'">{{ t('common.inactive') }}</button>
          </div>
        </div>

        <div class="opm-body">
          <div v-if="isLoading" class="opm-loading">
            <Icon name="lucide:loader-2" :size="20" class="spin" />
            <span>{{ t('common.loading') }}</span>
          </div>
          <div v-else-if="!filteredOfficers.length" class="opm-empty">{{ t('officers.no_officers') }}</div>
          <div v-else class="opm-list">
            <label
              v-for="officer in filteredOfficers"
              :key="officer.id"
              class="opm-item"
              :class="{ 'opm-item--selected': selectedIds.has(officer.id) }"
            >
              <input
                type="checkbox"
                class="opm-checkbox"
                :checked="selectedIds.has(officer.id)"
                @change="toggle(officer.id)"
              />
              <div v-if="officer.picture" class="opm-avatar">
                <img :src="officer.picture" :alt="officer.fullName" />
              </div>
              <div v-else class="opm-avatar opm-avatar--initials">{{ getInitials(officer.fullName) }}</div>
              <div class="opm-item-info">
                <span class="opm-item-name">{{ officer.fullName }}</span>
                <span class="opm-item-title">{{ officer.title }}</span>
                <span class="opm-item-community">{{ officer.communityName || '—' }}</span>
              </div>
              <span :class="['opm-item-status', officer.active ? 'opm-item-status--active' : 'opm-item-status--inactive']">
                {{ officer.active ? t('common.active') : t('common.inactive') }}
              </span>
            </label>
          </div>
        </div>

        <div class="opm-footer">
          <span class="opm-selected-count">
            {{ selectedIds.size ? `${selectedIds.size} selected` : '' }}
          </span>
          <button type="button" class="opm-btn opm-btn--cancel" @click="$emit('close')">{{ t('common.cancel') }}</button>
          <button
            type="button"
            class="opm-btn opm-btn--confirm"
            :disabled="isConfirming"
            @click="handleConfirm"
          >
            <Icon v-if="isConfirming" name="lucide:loader-2" :size="14" class="spin" />
            <span>{{ t('communities.add_officers') }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style>
.opm-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
}

.opm-modal {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 560px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}

.opm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.opm-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.opm-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--radius-md);
}
.opm-close:hover { background: var(--color-bg-elevated); color: var(--color-text-primary); }

.opm-filters {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.opm-search {
  position: relative;
  display: flex;
  align-items: center;
}

.opm-search-icon {
  position: absolute;
  left: var(--space-3);
  color: var(--color-text-muted);
  pointer-events: none;
}

.opm-search-input {
  width: 100%;
  padding: var(--space-2) var(--space-3) var(--space-2) calc(var(--space-3) + 22px);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  outline: none;
}
.opm-search-input:focus { border-color: var(--color-accent); }

.opm-status-tabs {
  display: flex;
  gap: var(--space-2);
}

.opm-tab {
  padding: 4px 12px;
  font-size: var(--font-size-xs);
  font-weight: 500;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.opm-tab--active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #0a0c10;
}

.opm-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-2) 0;
}

.opm-loading, .opm-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-8);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-style: italic;
}

.opm-list {
  display: flex;
  flex-direction: column;
}

.opm-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5);
  cursor: pointer;
  transition: background 0.12s;
  border-bottom: 1px solid var(--color-border);
}
.opm-item:last-child { border-bottom: none; }
.opm-item:hover { background: var(--color-bg-elevated); }
.opm-item--selected { background: rgba(17, 156, 166, 0.08); }

.opm-checkbox {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  accent-color: var(--color-accent);
  cursor: pointer;
}

.opm-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
  overflow: hidden;
}
.opm-avatar img { width: 100%; height: 100%; object-fit: cover; }
.opm-avatar--initials {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--color-text-muted);
}

.opm-item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.opm-item-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.opm-item-title {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.opm-item-community {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.opm-item-status {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: var(--radius-md);
}
.opm-item-status--active {
  background: rgba(17, 156, 166, 0.15);
  color: #119ca6;
  border: 1px solid rgba(17, 156, 166, 0.3);
}
.opm-item-status--inactive {
  background: rgba(148, 163, 184, 0.15);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.opm-footer {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

.opm-selected-count {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--color-accent);
  font-weight: 500;
}

.opm-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.15s, opacity 0.15s;
}
.opm-btn--cancel {
  background: transparent;
  border-color: var(--color-border);
  color: var(--color-text-secondary);
}
.opm-btn--cancel:hover { background: var(--color-bg-elevated); }
.opm-btn--confirm {
  background: var(--color-accent);
  color: #0a0c10;
}
.opm-btn--confirm:disabled { opacity: 0.45; cursor: not-allowed; }
.opm-btn--confirm:not(:disabled):hover { opacity: 0.88; }

@keyframes spin {
  to { transform: rotate(360deg); }
}
.spin { animation: spin 1s linear infinite; }
</style>
