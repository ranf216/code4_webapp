<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import PanicCallModal from './calls/PanicCallModal.vue'

interface NavItem {
  key: string
  label: string
  icon: string
  to: string
  badge: number | null
  badgeType?: 'critical'
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const { t } = useTranslation()
const route = useRoute()
const authStore = useAuthStore()

const baseGroups: NavGroup[] = [
  {
    label: t('nav.operate'),
    items: [
      { key: 'dashboard',       label: t('nav.dashboard'),        icon: 'lucide:layout-dashboard', to: '/dashboard',   badge: null },
      { key: 'live-tracking',   label: t('nav.live_tracking'),    icon: 'lucide:map',              to: '/live-tracking', badge: 24 },
      { key: 'calls-incidents', label: t('nav.calls_incidents'),  icon: 'lucide:phone',       to: '/calls',         badge: 1, badgeType: 'critical' },
      { key: 'tasks',           label: t('nav.tasks'),            icon: 'lucide:check-square',     to: '/tasks',         badge: 12 },
    ],
  },
  {
    label: t('nav.manage'),
    items: [
      { key: 'communities',     label: t('nav.communities'),      icon: 'lucide:home',             to: '/communities',   badge: null },
      { key: 'officers',        label: t('nav.officers'),         icon: 'lucide:user-round',           to: '/officers',      badge: null },
      { key: 'shifts-routes',   label: t('nav.shifts_routes'),    icon: 'lucide:calendar',            to: '/shifts',        badge: null },
      { key: 'post-orders',     label: t('nav.post_orders'),      icon: 'lucide:file-text',        to: '/post-orders',   badge: null },
      { key: 'poi-trespass',    label: t('nav.poi_trespass'),     icon: 'lucide:search-alert',          to: '/poi',           badge: null },
      { key: 'report-templates',label: t('nav.report_templates'), icon: 'lucide:panels-top-left',   to: '/reports',       badge: null },
    ],
  },
]

const adminGroup: NavGroup = {
  label: t('nav.admin'),
  items: [
    { key: 'users',    label: t('nav.users'),    icon: 'lucide:user',    to: '/users',    badge: null },
    { key: 'settings', label: t('nav.settings'), icon: 'lucide:settings', to: '/settings', badge: null },
  ],
}

const navGroups = computed<NavGroup[]>(() => {
  if (authStore.isAdmin) {
    return [...baseGroups, adminGroup]
  }
  return baseGroups
})

function isActive(to: string) {
  return route.path === to || route.path.startsWith(to + '/')
}

function handleLogout() {
  authStore.clearAuth()
  navigateTo('/login')
}

// Test Panic Call
const showPanicModal = ref(false)

function openTestPanicCall() {
  showPanicModal.value = true
}

function closePanicModal() {
  showPanicModal.value = false
}
</script>

<template>
  <aside class="sidebar">
    <!-- Brand -->
    <div class="sidebar__brand">
      <Icon name="lucide:locate-fixed" :size="20" class="sidebar__brand-icon" />
      <span class="sidebar__name">AXIS</span>
    </div>

    <!-- Org info -->
    <div class="sidebar__org">
      <div class="sidebar__org-avatar">C4</div>
      <div class="sidebar__org-info">
        <span class="sidebar__org-name">Code 4 Operations</span>
        <span class="sidebar__org-meta">6 communities · 65 officers</span>
      </div>
      <Icon name="lucide:chevron-right" :size="14" class="sidebar__org-chevron" />
    </div>

    <!-- Nav -->
    <nav class="sidebar__nav">
      <div
        v-for="group in navGroups"
        :key="group.label"
        class="sidebar__group"
      >
        <span class="sidebar__group-label">{{ group.label }}</span>
        <NuxtLink
          v-for="item in group.items"
          :key="item.key"
          :to="item.to"
          class="sidebar__item"
          :class="{ 'sidebar__item--active': isActive(item.to) }"
        >
          <Icon :name="item.icon" :size="16" class="sidebar__item-icon" />
          <span class="sidebar__item-label">{{ item.label }}</span>
          <span
            v-if="item.badge"
            class="sidebar__item-badge"
            :class="item.badgeType === 'critical' ? 'sidebar__item-badge--critical' : ''"
          >{{ item.badge }}</span>
        </NuxtLink>
      </div>
    </nav>

    <!-- Test Panic Call Button -->
    <div class="sidebar__test-section">
      <button class="test-panic-btn" @click="openTestPanicCall">
        <Icon name="lucide:alert-triangle" :size="16" />
        <span>{{ t('nav.test_panic_call') }}</span>
      </button>
    </div>

    <!-- Logout -->
    <div class="sidebar__footer">
      <button class="sidebar__logout" @click="handleLogout">
        <Icon name="lucide:log-out" :size="16" class="sidebar__logout-icon" />
        <span class="sidebar__logout-label">{{ t('common.logout') }}</span>
      </button>
    </div>

    <!-- Panic Call Modal -->
    <PanicCallModal
      :show="showPanicModal"
      @close="closePanicModal"
    />
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--color-sidebar-width, 240px);
  min-width: var(--color-sidebar-width, 240px);
  height: 100vh;
  background: var(--color-sidebar-bg);
  border-right: 1px solid var(--color-sidebar-border);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  position: sticky;
  top: 0;
}

/* Brand */
.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 22px var(--space-6);
  border-bottom: 1px solid var(--color-sidebar-border);
  flex-shrink: 0;
}
.sidebar__brand-icon {
  color: var(--color-text-primary);
  flex-shrink: 0;
  opacity: 0.9;
}
.sidebar__name {
  font-size: var(--font-size-md);
  font-weight: 700;
  letter-spacing: 0.14em;
  color: var(--color-text-primary);
  text-transform: uppercase;
}

/* Org */
.sidebar__org {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-6);
  border-bottom: 1px solid var(--color-sidebar-border);
  cursor: pointer;
  transition: background var(--transition-base);
  flex-shrink: 0;
}
.sidebar__org:hover {
  background: var(--color-bg-overlay);
}
.sidebar__org-avatar {
  width: 22px;
  height: 22px;
  background: linear-gradient(135deg, #1196ad 0%, #576bcf 100%);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
  color: white;
  flex-shrink: 0;
}
.sidebar__org-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 0;
}
.sidebar__org-name {
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sidebar__org-meta {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
.sidebar__org-chevron {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

/* Nav */
.sidebar__nav {
  flex: 1;
  padding: var(--space-7) 0 var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.sidebar__group {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.sidebar__group-label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  padding: 0 var(--space-6) var(--space-3);
  opacity: 0.7;
}
.sidebar__item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 7px var(--space-4);
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  font-weight: 400;
  text-decoration: none;
  position: relative;
  transition: background var(--transition-base), color var(--transition-base);
  border-radius: 0;
}
.sidebar__item:hover {
  background: var(--color-bg-overlay);
  color: var(--color-text-primary);
}
.sidebar__item--active {
  color: var(--color-text-primary);
  font-weight: 500;
}
.sidebar__item--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 3px;
  background: var(--color-accent);
  border-radius: 0 2px 2px 0;
}
.sidebar__item-icon {
  flex-shrink: 0;
  opacity: 0.7;
  margin-left: var(--space-2);
}
.sidebar__item--active .sidebar__item-icon {
  opacity: 1;
  color: var(--color-accent);
}
.sidebar__item-label {
  flex: 1;
  color: #b5bac4;
  opacity: 1;
}
.sidebar__item--active .sidebar__item-label {
  font-weight: 700;
  color: white;
}
.sidebar__item-badge {
  min-width: 20px;
  height: 18px;
  padding: 0 5px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}
.sidebar__item-badge--critical {
  background: var(--color-critical-bg);
  border-color: transparent;
  color: var(--color-critical);
}

/* Test Section */
.sidebar__test-section {
  padding: var(--space-3) var(--space-6);
  border-top: 1px solid var(--color-sidebar-border);
}

.test-panic-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: none;
  border-radius: var(--radius-lg);
  color: white;
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
}

.test-panic-btn:hover {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.test-panic-btn :deep(svg) {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
}

/* Footer / Logout */
.sidebar__footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-sidebar-border);
  flex-shrink: 0;
}

.sidebar__logout {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: 10px var(--space-4);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: background var(--transition-base), color var(--transition-base);
}

.sidebar__logout:hover {
  background: var(--color-bg-overlay);
  color: var(--color-critical, #ef4444);
}

.sidebar__logout-icon {
  flex-shrink: 0;
  opacity: 0.7;
  margin-left: var(--space-2);
}

.sidebar__logout:hover .sidebar__logout-icon {
  opacity: 1;
}

.sidebar__logout-label {
  flex: 1;
  text-align: left;
}

/* Panic Call Modal Styles Override */
:global(.panic-call-modal) {
  max-height: 80vh;
}
</style>
