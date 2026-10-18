<script setup lang="ts">
const props = withDefaults(defineProps<{
  show: boolean
  images: string[]
  initialIndex?: number
  alt?: string
  thumbnailUrl?: string
  showThumbnailClose?: boolean
  thumbnailSize?: number
}>(), {
  thumbnailSize: 100,
})

const emit = defineEmits<{
  close: []
  remove: []
}>()

const isOpen = ref(props.show)
const currentIndex = ref(props.initialIndex ?? 0)

watch(() => props.show, (show) => {
  isOpen.value = show
  if (show) {
    currentIndex.value = props.initialIndex ?? 0
  }
})

watch(() => props.initialIndex, (index) => {
  if (index !== undefined) {
    currentIndex.value = index
  }
})

function openModal() {
  isOpen.value = true
}

function closeModal() {
  isOpen.value = false
  emit('close')
}

function removeThumbnail() {
  emit('remove')
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
  if (!isOpen.value) return
  if (e.key === 'Escape') closeModal()
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
  <template v-if="thumbnailUrl">
    <div class="thumbnail-preview" :style="{ width: `${thumbnailSize}px`, height: `${thumbnailSize}px` }">
      <img :src="thumbnailUrl" :alt="alt || 'Preview image'" class="thumbnail-image" @click="openModal" />
      <button
        v-if="showThumbnailClose"
        type="button"
        class="thumbnail-close"
        @click.stop="removeThumbnail"
      >
        <Icon name="lucide:x" :size="12" />
      </button>
    </div>
  </template>

  <Teleport to="body">
    <Transition name="preview-fade">
      <div v-if="isOpen" class="image-preview-overlay" @click.self="closeModal">
        <!-- Close button -->
        <button class="preview-close" @click="closeModal">
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
.thumbnail-preview {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border);
  background: var(--color-bg-elevated);
  cursor: pointer;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumbnail-close {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  transition: background 0.2s;
}

.thumbnail-close:hover {
  background: rgba(0, 0, 0, 0.7);
}

.image-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
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
