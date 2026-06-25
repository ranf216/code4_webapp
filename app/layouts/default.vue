<template>
  <div class="app-shell">
    <AppSidebar />
    <div class="app-main">
      <slot />
    </div>
    <LoadingModal :show="loadingStore.showLoading" :message="loadingStore.message" />
  </div>
</template>

<script setup>
const loadingStore = useLoadingStore()
</script>

<style scoped>
.app-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--color-bg-base);
}
.app-main {
  flex: 1;
  min-width: 0;
  width: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
</style>
