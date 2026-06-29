<script setup lang="ts">
definePageMeta({ layout: 'default' })
</script>

<template>
  <div class="poi-page">
    <POIList />
  </div>
</template>

<style scoped>
.poi-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
