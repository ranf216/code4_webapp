<script setup lang="ts">
// Redirect root to login for now
// TODO: redirect to dashboard if already authenticated
await navigateTo('/login', { replace: true })
</script>

<template>
  <div />
</template>
