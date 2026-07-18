<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: (to) => navigateTo(`/communities/${to.params.id as string}/residents`, { replace: true }),
})
</script>
