<script setup lang="ts">
const sampleMarkers = [
  { lat: 34.0545, lng: -118.2450, status: 'active'     as const },
  { lat: 34.0510, lng: -118.2410, status: 'responding' as const },
  { lat: 34.0530, lng: -118.2480, status: 'idle'       as const },
  { lat: 34.0500, lng: -118.2460, status: 'active'     as const },
]
</script>

<template>
  <div class="live-ops card">
    <!-- Header -->
    <div class="live-ops__header">
      <span class="live-ops__title">LIVE OPERATIONS</span>
      <div class="live-ops__actions">
        <span class="live-badge">
          <span class="live-badge__dot" />
          Live
        </span>
        <button class="live-ops__fullscreen">
          Open full screen
        </button>
      </div>
    </div>

    <!-- Map -->
    <div class="live-ops__map">
      <GoogleMap
        :center="{ lat: 34.0522, lng: -118.2437 }"
        :zoom="15"
        :markers="sampleMarkers"
        height="100%"
      />
    </div>
  </div>
</template>

<style scoped>
.live-ops {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.live-ops__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}
.live-ops__title {
  font-size: var(--font-size-base);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.live-ops__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px var(--space-2);
  background: rgba(17, 156, 166, 0.12);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: #119ca6;
}
.live-badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #119ca6;
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.live-ops__fullscreen {
  font-size: var(--font-size-base);
  font-weight: 500;
  padding: 5px var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background var(--transition-base);
  font-family: var(--font-family);
}
.live-ops__fullscreen:hover {
  background: var(--color-bg-overlay);
}

.live-ops__map {
  flex: 1;
  min-height: 300px;
  background: var(--color-bg-elevated);
  position: relative;
  overflow: hidden;
}
.live-ops__map-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  opacity: 0.4;
}
.live-ops__zoom {
  position: absolute;
  right: var(--space-3);
  bottom: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.live-ops__zoom-btn {
  width: 26px;
  height: 26px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background var(--transition-base);
}
.live-ops__zoom-btn:hover { background: var(--color-bg-overlay); }
</style>
