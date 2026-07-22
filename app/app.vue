<script setup lang="ts">
import { useNotificationSocket } from '~/composables/useNotificationSocket'

// Initialize real-time notification socket connection
useNotificationSocket()
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
