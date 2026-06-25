<template>
  <div class="auth-shell">
    <slot />
    <LoadingModal :show="loadingStore.showLoading" :message="loadingStore.message" />
  </div>
</template>

<script setup>
const loadingStore = useLoadingStore()
</script>

<style scoped>
.auth-shell {
  min-height: 100vh;
  background: var(--color-bg-base);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
