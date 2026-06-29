<script setup lang="ts">
definePageMeta({ layout: 'default' })
</script>

<template>
  <div class="poi-new-page">
    <POIForm mode="create" />
  </div>
</template>

<style scoped>
.poi-new-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
