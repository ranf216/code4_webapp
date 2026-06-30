<script setup lang="ts">
const props = defineProps<{
  photos: string[]
  startIndex?: number
}>()

const emit = defineEmits<{
  close: []
}>()

const currentIndex = ref(props.startIndex ?? 0)

function prev() {
  if (currentIndex.value > 0) currentIndex.value--
}

function next() {
  if (currentIndex.value < props.photos.length - 1) currentIndex.value++
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
  if (e.key === 'ArrowLeft') prev()
  if (e.key === 'ArrowRight') next()
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <Teleport to="body">
    <div class="lightbox" @click="emit('close')">
      <!-- Close -->
      <button class="lightbox__close" @click="emit('close')">
        <Icon name="lucide:x" :size="20" />
      </button>

      <!-- Counter -->
      <div class="lightbox__counter">{{ currentIndex + 1 }} / {{ photos.length }}</div>

      <!-- Prev -->
      <button
        v-if="photos.length > 1"
        class="lightbox__nav lightbox__nav--prev"
        :disabled="currentIndex === 0"
        @click.stop="prev"
      >
        <Icon name="lucide:chevron-left" :size="24" />
      </button>

      <!-- Image -->
      <img
        :src="photos[currentIndex]"
        class="lightbox__img"
        @click.stop
      />

      <!-- Next -->
      <button
        v-if="photos.length > 1"
        class="lightbox__nav lightbox__nav--next"
        :disabled="currentIndex === photos.length - 1"
        @click.stop="next"
      >
        <Icon name="lucide:chevron-right" :size="24" />
      </button>

      <!-- Thumbnail strip -->
      <div v-if="photos.length > 1" class="lightbox__strip" @click.stop>
        <button
          v-for="(url, idx) in photos"
          :key="idx"
          class="lightbox__thumb"
          :class="{ 'lightbox__thumb--active': idx === currentIndex }"
          @click="currentIndex = idx"
        >
          <img :src="url" :alt="`Photo ${idx + 1}`" />
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  flex-direction: column;
  gap: var(--space-4);
}

/* ── Close ── */
.lightbox__close {
  position: absolute;
  top: var(--space-5);
  right: var(--space-5);
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: background var(--transition-base);
}
.lightbox__close:hover { background: rgba(255, 255, 255, 0.22); }

/* ── Counter ── */
.lightbox__counter {
  position: absolute;
  top: var(--space-5);
  left: 50%;
  transform: translateX(-50%);
  font-size: var(--font-size-sm);
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

/* ── Main image ── */
.lightbox__img {
  max-width: min(90vw, 900px);
  max-height: 72vh;
  border-radius: var(--radius-lg);
  object-fit: contain;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
}

/* ── Nav buttons ── */
.lightbox__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: background var(--transition-base);
}
.lightbox__nav:hover:not(:disabled) { background: rgba(255, 255, 255, 0.22); }
.lightbox__nav:disabled { opacity: 0.25; cursor: default; }
.lightbox__nav--prev { left: var(--space-5); }
.lightbox__nav--next { right: var(--space-5); }

/* ── Thumbnail strip ── */
.lightbox__strip {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-2);
  background: rgba(0, 0, 0, 0.4);
  border-radius: var(--radius-lg);
  max-width: 90vw;
  overflow-x: auto;
}

.lightbox__thumb {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  flex-shrink: 0;
  padding: 0;
  background: none;
  opacity: 0.55;
  transition: all var(--transition-base);
}
.lightbox__thumb:hover { opacity: 0.85; }
.lightbox__thumb--active {
  border-color: white;
  opacity: 1;
}
.lightbox__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
