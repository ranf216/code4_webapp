<script setup lang="ts">
const props = defineProps<{
  show: boolean
  images: string[]
  initialIndex?: number
  alt?: string
}>()

const emit = defineEmits<{
  close: []
}>()

const currentIndex = ref(props.initialIndex ?? 0)

watch(() => props.show, (show) => {
  if (show) {
    currentIndex.value = props.initialIndex ?? 0
  }
})

watch(() => props.initialIndex, (index) => {
  if (index !== undefined) {
    currentIndex.value = index
  }
})

function close() {
  emit('close')
}

function nextImage() {
  if (!props.images.length) return
  currentIndex.value = (currentIndex.value + 1) % props.images.length
}

function prevImage() {
  if (!props.images.length) return
  currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length
}

function onKeydown(e: KeyboardEvent) {
  if (!props.show) return
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowRight') nextImage()
  if (e.key === 'ArrowLeft') prevImage()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="preview-fade">
      <div v-if="show" class="image-preview-overlay" @click.self="close">
        <!-- Close button -->
        <button class="preview-close" @click="close">
          <Icon name="lucide:x" :size="24" />
        </button>

        <!-- Counter -->
        <div v-if="images.length > 1" class="preview-counter">
          {{ currentIndex + 1 }} / {{ images.length }}
        </div>

        <!-- Navigation -->
        <button
          v-if="images.length > 1"
          class="preview-nav preview-nav--prev"
          @click.stop="prevImage"
        >
          <Icon name="lucide:chevron-left" :size="32" />
        </button>
        <button
          v-if="images.length > 1"
          class="preview-nav preview-nav--next"
          @click.stop="nextImage"
        >
          <Icon name="lucide:chevron-right" :size="32" />
        </button>

        <!-- Image -->
        <div class="preview-image-wrapper" @click.stop>
          <img
            :src="images[currentIndex]"
            :alt="alt || 'Preview image'"
            class="preview-image"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.image-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.9);
  padding: var(--space-8);
}

.preview-image-wrapper {
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: var(--radius-md);
}

.preview-close {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.preview-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.preview-counter {
  position: absolute;
  top: var(--space-4);
  left: 50%;
  transform: translateX(-50%);
  padding: var(--space-1) var(--space-3);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

.preview-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.preview-nav:hover {
  background: rgba(255, 255, 255, 0.25);
}

.preview-nav--prev {
  left: var(--space-4);
}

.preview-nav--next {
  right: var(--space-4);
}

.preview-fade-enter-active,
.preview-fade-leave-active {
  transition: opacity 0.2s ease;
}

.preview-fade-enter-from,
.preview-fade-leave-to {
  opacity: 0;
}
</style>
