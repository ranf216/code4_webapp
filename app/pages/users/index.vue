<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { AdminUserRole } from '~/api/types/adminUser'

definePageMeta({ layout: 'default' })

const authStore = useAuthStore()
const isSuperAdmin = computed(() => authStore.roles.includes(AdminUserRole.SUPER_ADMIN))
</script>

<template>
  <AppHeader
    v-if="isSuperAdmin"
    title="Users"
    :breadcrumb="[{ label: 'Admin' }, { label: 'Users' }]"
    :show-search="false"
  />
  <div v-if="isSuperAdmin" class="users-page">
    <UsersManagement />
  </div>
  <div v-else class="access-denied">
    <Icon name="lucide:shield-alert" :size="48" />
    <h1>Access Denied</h1>
    <p>You must be a Super Admin to access the Users Management page.</p>
  </div>
</template>

<style scoped>
.users-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--space-6);
  overflow-y: auto;
}

.access-denied {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-6);
  text-align: center;
  color: var(--color-text-muted);
}

.access-denied h1 {
  margin: 0;
  font-size: var(--font-size-xl);
  color: var(--color-text-primary);
}

.access-denied p {
  margin: 0;
  max-width: 400px;
}
</style>
