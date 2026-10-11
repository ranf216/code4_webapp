<script setup lang="ts">
definePageMeta({ layout: 'default' })
</script>

<template>
  <div class="reports-editor-page">
    <TemplateEditor mode="create" />
  </div>
</template>

<style scoped>
.reports-editor-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
