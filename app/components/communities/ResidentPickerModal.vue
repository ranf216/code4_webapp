<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { residentApi } from '~/api/resident'

interface PickerResident {
  id: string
  fullName: string
  phone: string
  email: string
  active: boolean
  communityName: string | null
}

const props = defineProps<{
  show: boolean
  preselectedIds?: string[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', residents: PickerResident[]): void
}>()

const { t } = useTranslation()

const allResidents = ref<PickerResident[]>([])
const isLoading = ref(false)
const searchQuery = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')
const selectedIds = ref<Set<string>>(new Set())
const isConfirming = ref(false)

const filteredResidents = computed(() => {
  let list = allResidents.value
  if (statusFilter.value === 'active') list = list.filter((r) => r.active)
  else if (statusFilter.value === 'inactive') list = list.filter((r) => !r.active)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(
      (r) =>
        r.fullName.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q)
    )
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
  const result = allResidents.value.filter((r) => selectedIds.value.has(r.id))
  emit('confirm', result)
}

async function loadResidents() {
  if (allResidents.value.length) return
  isLoading.value = true
  try {
    const response = await residentApi.getResidents({
      include_inactive: true,
    })
    if (response.rc === 0 && response.residents) {
      allResidents.value = response.residents.map((r: any) => ({
        id: r.user_id,
        fullName: [r.first_name, r.last_name].filter(Boolean).join(' '),
        phone: r.phone_num || '',
        email: r.email || '',
        active: r.is_active,
        communityName: r.community_name || null,
      }))
    }
  } catch (err) {
    console.error('Error loading residents:', err)
  } finally {
    isLoading.value = false
  }
}

watch(() => props.show, (val) => {
  if (val) {
    searchQuery.value = ''
    statusFilter.value = 'all'
    selectedIds.value = new Set(props.preselectedIds || [])
    loadResidents()
  }
})
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="rpm-backdrop" @click.self="$emit('close')">
      <div class="rpm-modal">
        <div class="rpm-header">
          <h3 class="rpm-title">{{ t('communities.add_residents') }}</h3>
          <button type="button" class="rpm-close" @click="$emit('close')">
            <Icon name="lucide:x" :size="18" />
          </button>
        </div>

        <div class="rpm-filters">
          <div class="rpm-search">
            <Icon name="lucide:search" :size="15" class="rpm-search-icon" />
            <input
              v-model="searchQuery"
              type="text"
              class="rpm-search-input"
              :placeholder="t('common.search') + '…'"
            />
          </div>
          <div class="rpm-status-tabs">
            <button type="button" :class="['rpm-tab', { 'rpm-tab--active': statusFilter === 'all' }]" @click="statusFilter = 'all'">{{ t('common.all') }}</button>
            <button type="button" :class="['rpm-tab', { 'rpm-tab--active': statusFilter === 'active' }]" @click="statusFilter = 'active'">{{ t('common.active') }}</button>
            <button type="button" :class="['rpm-tab', { 'rpm-tab--active': statusFilter === 'inactive' }]" @click="statusFilter = 'inactive'">{{ t('common.inactive') }}</button>
          </div>
        </div>

        <div class="rpm-body">
          <div v-if="isLoading" class="rpm-loading">
            <Icon name="lucide:loader-2" :size="20" class="spin" />
            <span>{{ t('common.loading') }}</span>
          </div>
          <div v-else-if="!filteredResidents.length" class="rpm-empty">{{ t('residents.no_residents') }}</div>
          <div v-else class="rpm-list">
            <label
              v-for="resident in filteredResidents"
              :key="resident.id"
              class="rpm-item"
              :class="{ 'rpm-item--selected': selectedIds.has(resident.id) }"
            >
              <input
                type="checkbox"
                class="rpm-checkbox"
                :checked="selectedIds.has(resident.id)"
                @change="toggle(resident.id)"
              />
              <div class="rpm-avatar rpm-avatar--initials">{{ getInitials(resident.fullName) }}</div>
              <div class="rpm-item-info">
                <span class="rpm-item-name">{{ resident.fullName }}</span>
                <span class="rpm-item-title">{{ resident.phone || resident.email }}</span>
                <span class="rpm-item-community">{{ resident.communityName || '—' }}</span>
              </div>
              <span :class="['rpm-item-status', resident.active ? 'rpm-item-status--active' : 'rpm-item-status--inactive']">
                {{ resident.active ? t('common.active') : t('common.inactive') }}
              </span>
            </label>
          </div>
        </div>

        <div class="rpm-footer">
          <span class="rpm-selected-count">
            {{ selectedIds.size ? `${selectedIds.size} selected` : '' }}
          </span>
          <button type="button" class="rpm-btn rpm-btn--cancel" @click="$emit('close')">{{ t('common.cancel') }}</button>
          <button
            type="button"
            class="rpm-btn rpm-btn--confirm"
            :disabled="isConfirming"
            @click="handleConfirm"
          >
            <Icon v-if="isConfirming" name="lucide:loader-2" :size="14" class="spin" />
            <span>{{ t('communities.add_residents') }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style>
.rpm-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
}

.rpm-modal {
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

.rpm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.rpm-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.rpm-close {
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
.rpm-close:hover { background: var(--color-bg-elevated); color: var(--color-text-primary); }

.rpm-filters {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.rpm-search {
  position: relative;
  display: flex;
  align-items: center;
}

.rpm-search-icon {
  position: absolute;
  left: var(--space-3);
  color: var(--color-text-muted);
  pointer-events: none;
}

.rpm-search-input {
  width: 100%;
  padding: var(--space-2) var(--space-3) var(--space-2) calc(var(--space-3) + 22px);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  outline: none;
}
.rpm-search-input:focus { border-color: var(--color-accent); }

.rpm-status-tabs {
  display: flex;
  gap: var(--space-2);
}

.rpm-tab {
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
.rpm-tab--active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #0a0c10;
}

.rpm-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-2) 0;
}

.rpm-loading, .rpm-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-8);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-style: italic;
}

.rpm-list {
  display: flex;
  flex-direction: column;
}

.rpm-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5);
  cursor: pointer;
  transition: background 0.12s;
  border-bottom: 1px solid var(--color-border);
}
.rpm-item:last-child { border-bottom: none; }
.rpm-item:hover { background: var(--color-bg-elevated); }
.rpm-item--selected { background: rgba(17, 156, 166, 0.08); }

.rpm-checkbox {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  accent-color: var(--color-accent);
  cursor: pointer;
}

.rpm-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
  overflow: hidden;
}
.rpm-avatar img { width: 100%; height: 100%; object-fit: cover; }
.rpm-avatar--initials {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--color-text-muted);
}

.rpm-item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.rpm-item-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.rpm-item-title {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.rpm-item-community {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.rpm-item-status {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: var(--radius-md);
}
.rpm-item-status--active {
  background: rgba(17, 156, 166, 0.15);
  color: #119ca6;
  border: 1px solid rgba(17, 156, 166, 0.3);
}
.rpm-item-status--inactive {
  background: rgba(148, 163, 184, 0.15);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.rpm-footer {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

.rpm-selected-count {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--color-accent);
  font-weight: 500;
}

.rpm-btn {
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
.rpm-btn--cancel {
  background: transparent;
  border-color: var(--color-border);
  color: var(--color-text-secondary);
}
.rpm-btn--cancel:hover { background: var(--color-bg-elevated); }
.rpm-btn--confirm {
  background: var(--color-accent);
  color: #0a0c10;
}
.rpm-btn--confirm:disabled { opacity: 0.45; cursor: not-allowed; }
.rpm-btn--confirm:not(:disabled):hover { opacity: 0.88; }

@keyframes spin {
  to { transform: rotate(360deg); }
}
.spin { animation: spin 1s linear infinite; }
</style>
