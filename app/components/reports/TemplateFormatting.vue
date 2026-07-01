<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

type HeaderLayout = 'compact' | 'standard' | 'full_banner'
type FontOption = 'arial' | 'calibri' | 'times_new_roman'
type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
type SectionBreaks = 'new_page' | 'continuous'

interface StyleSettings {
  templateId: string
  templateName: string
  logoUrl: string | null
  accentColour: string
  headerLayout: HeaderLayout
  font: FontOption
  pageNumbering: boolean
  confidentialityFooter: string
  dateFormat: DateFormat
  sectionBreaks: SectionBreaks
  includeCoverPage: boolean
}

const props = defineProps<{
  styleSettings: StyleSettings
}>()

const { t } = useTranslation()
const router = useRouter()

function buildForm(): StyleSettings {
  return {
    templateId: props.styleSettings.templateId,
    templateName: props.styleSettings.templateName,
    logoUrl: props.styleSettings.logoUrl,
    accentColour: props.styleSettings.accentColour,
    headerLayout: props.styleSettings.headerLayout,
    font: props.styleSettings.font,
    pageNumbering: props.styleSettings.pageNumbering,
    confidentialityFooter: props.styleSettings.confidentialityFooter,
    dateFormat: props.styleSettings.dateFormat,
    sectionBreaks: props.styleSettings.sectionBreaks,
    includeCoverPage: props.styleSettings.includeCoverPage,
  }
}

const form = reactive<StyleSettings>(buildForm())
const isSubmitting = ref(false)
const logoPreview = ref<string | null>(form.logoUrl)
const logoFileInput = ref<HTMLInputElement | null>(null)

const PRESET_COLOURS = [
  '#1d4ed8', '#2563eb', '#0ea5e9', '#14b8a6',
  '#10b981', '#84cc16', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#64748b', '#1e293b',
]

function onLogoClick() {
  logoFileInput.value?.click()
}

function onLogoChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    logoPreview.value = ev.target?.result as string
    form.logoUrl = logoPreview.value
  }
  reader.readAsDataURL(file)
}

function removeLogo() {
  logoPreview.value = null
  form.logoUrl = null
  if (logoFileInput.value) logoFileInput.value.value = ''
}

function handleSave() {
  isSubmitting.value = true
  console.log('[TemplateFormatting] save', form)
  setTimeout(() => {
    isSubmitting.value = false
    router.push('/reports')
  }, 700)
}

function handleCancel() {
  router.push('/reports')
}

const accentPreview = computed(() => form.accentColour || '#1d4ed8')

const headerLayouts: { value: HeaderLayout; label: string; desc: string; icon: string }[] = [
  { value: 'compact',     label: 'Compact',          desc: 'Logo + title on one line',              icon: 'lucide:layout-template' },
  { value: 'standard',    label: 'Standard',          desc: 'Logo left, title & metadata right',     icon: 'lucide:layout-dashboard' },
  { value: 'full_banner', label: 'Full-Width Banner',  desc: 'Logo and title in a wide header strip', icon: 'lucide:layout-panel-top' },
]

const fontOptions: { value: FontOption; label: string }[] = [
  { value: 'arial',             label: 'Arial (default)' },
  { value: 'calibri',           label: 'Calibri' },
  { value: 'times_new_roman',   label: 'Times New Roman' },
]

const dateFormats: { value: DateFormat; label: string }[] = [
  { value: 'MM/DD/YYYY',  label: 'MM/DD/YYYY' },
  { value: 'DD/MM/YYYY',  label: 'DD/MM/YYYY' },
  { value: 'YYYY-MM-DD',  label: 'YYYY-MM-DD' },
]

const sectionBreakOptions: { value: SectionBreaks; label: string; desc: string }[] = [
  { value: 'continuous', label: 'Continuous',       desc: 'Sections separated by a divider line only' },
  { value: 'new_page',   label: 'New Page',          desc: 'Each section starts on a new page' },
]

const todayFormatted = computed(() => {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const yyyy = d.getFullYear()
  const map: Record<string, string> = {
    'MM/DD/YYYY': `${mm}/${dd}/${yyyy}`,
    'DD/MM/YYYY': `${dd}/${mm}/${yyyy}`,
    'YYYY-MM-DD': `${yyyy}-${mm}-${dd}`,
  }
  return map[form.dateFormat] ?? `${dd}/${mm}/${yyyy}`
})
</script>

<template>
  <div class="tpl-fmt">
    <!-- ── Page Header ── -->
    <div class="tpl-fmt__page-header">
      <button class="back-btn" @click="handleCancel">
        <Icon name="lucide:arrow-left" :size="16" />
      </button>
      <div class="tpl-fmt__page-title-area">
        <h1 class="tpl-fmt__page-title">{{ t('fmt.title') }}</h1>
        <p class="tpl-fmt__page-sub">{{ form.templateName }}</p>
      </div>
      <div class="tpl-fmt__header-actions">
        <button class="btn-cancel" @click="handleCancel">{{ t('common.cancel') }}</button>
        <button class="btn-save" :disabled="isSubmitting" @click="handleSave">
          <Icon v-if="isSubmitting" name="lucide:loader-2" :size="14" class="spin" />
          <Icon v-else name="lucide:check" :size="14" />
          {{ t('fmt.save') }}
        </button>
      </div>
    </div>

    <!-- ── Body: form + live preview ── -->
    <div class="tpl-fmt__body">

      <!-- Left: settings form -->
      <div class="tpl-fmt__settings">

        <!-- ── Company Logo ── -->
        <section class="fmt-section">
          <h3 class="fmt-section__title">
            <Icon name="lucide:image" :size="15" />
            {{ t('fmt.section_branding') }}
          </h3>

          <div class="fmt-field">
            <label class="fmt-field__label">{{ t('fmt.logo') }}</label>
            <div class="logo-upload-area" @click="onLogoClick">
              <div v-if="logoPreview" class="logo-preview-wrap">
                <img :src="logoPreview" alt="logo" class="logo-preview-img" />
                <button class="logo-remove-btn" @click.stop="removeLogo">
                  <Icon name="lucide:x" :size="12" />
                </button>
              </div>
              <div v-else class="logo-upload-placeholder">
                <Icon name="lucide:upload-cloud" :size="24" class="upload-icon" />
                <span>{{ t('fmt.logo_upload_hint') }}</span>
                <span class="logo-upload-sub">PNG, JPG up to 2 MB</span>
              </div>
            </div>
            <input
              ref="logoFileInput"
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              class="sr-only"
              @change="onLogoChange"
            />
          </div>

          <div class="fmt-field">
            <label class="fmt-field__label">{{ t('fmt.accent_colour') }}</label>
            <div class="colour-row">
              <div class="colour-input-wrap">
                <input v-model="form.accentColour" type="color" class="colour-picker" />
                <input
                  v-model="form.accentColour"
                  type="text"
                  class="colour-hex-input"
                  maxlength="7"
                  placeholder="#1d4ed8"
                />
              </div>
              <div class="colour-presets">
                <button
                  v-for="c in PRESET_COLOURS"
                  :key="c"
                  class="colour-preset"
                  :class="{ 'colour-preset--active': form.accentColour === c }"
                  :style="{ background: c }"
                  :title="c"
                  @click="form.accentColour = c"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- ── Layout & Typography ── -->
        <section class="fmt-section">
          <h3 class="fmt-section__title">
            <Icon name="lucide:layout-template" :size="15" />
            {{ t('fmt.section_layout') }}
          </h3>

          <div class="fmt-field">
            <label class="fmt-field__label">{{ t('fmt.header_layout') }}</label>
            <div class="layout-cards">
              <button
                v-for="opt in headerLayouts"
                :key="opt.value"
                class="layout-card"
                :class="{ 'layout-card--active': form.headerLayout === opt.value }"
                @click="form.headerLayout = opt.value"
              >
                <Icon :name="opt.icon" :size="20" />
                <span class="layout-card__label">{{ opt.label }}</span>
                <span class="layout-card__desc">{{ opt.desc }}</span>
              </button>
            </div>
          </div>

          <div class="fmt-field">
            <label class="fmt-field__label">{{ t('fmt.font') }}</label>
            <select v-model="form.font" class="fmt-select">
              <option v-for="f in fontOptions" :key="f.value" :value="f.value">{{ f.label }}</option>
            </select>
          </div>
        </section>

        <!-- ── Page Options ── -->
        <section class="fmt-section">
          <h3 class="fmt-section__title">
            <Icon name="lucide:file-text" :size="15" />
            {{ t('fmt.section_page') }}
          </h3>

          <div class="fmt-field">
            <label class="fmt-field__label">{{ t('fmt.date_format') }}</label>
            <div class="segmented-group">
              <button
                v-for="df in dateFormats"
                :key="df.value"
                class="segmented-btn"
                :class="{ 'segmented-btn--active': form.dateFormat === df.value }"
                @click="form.dateFormat = df.value"
              >
                {{ df.label }}
              </button>
            </div>
            <span class="fmt-field__hint">{{ t('fmt.date_format_preview') }}: <strong>{{ todayFormatted }}</strong></span>
          </div>

          <div class="fmt-field">
            <label class="fmt-field__label">{{ t('fmt.section_breaks') }}</label>
            <div class="radio-group">
              <label
                v-for="opt in sectionBreakOptions"
                :key="opt.value"
                class="radio-option"
                :class="{ 'radio-option--active': form.sectionBreaks === opt.value }"
                @click="form.sectionBreaks = opt.value"
              >
                <span class="radio-dot" :class="{ 'radio-dot--on': form.sectionBreaks === opt.value }" />
                <span class="radio-option__text">
                  <span class="radio-option__label">{{ opt.label }}</span>
                  <span class="radio-option__desc">{{ opt.desc }}</span>
                </span>
              </label>
            </div>
          </div>

          <!-- Toggle rows -->
          <div class="toggle-list">
            <div class="toggle-row">
              <div class="toggle-row__info">
                <span class="toggle-row__label">{{ t('fmt.page_numbering') }}</span>
                <span class="toggle-row__desc">{{ t('fmt.page_numbering_desc') }}</span>
              </div>
              <button
                class="toggle-switch"
                :class="{ 'toggle-switch--on': form.pageNumbering }"
                @click="form.pageNumbering = !form.pageNumbering"
              >
                <span class="toggle-switch__thumb" />
              </button>
            </div>

            <div class="toggle-row">
              <div class="toggle-row__info">
                <span class="toggle-row__label">{{ t('fmt.include_cover_page') }}</span>
                <span class="toggle-row__desc">{{ t('fmt.include_cover_page_desc') }}</span>
              </div>
              <button
                class="toggle-switch"
                :class="{ 'toggle-switch--on': form.includeCoverPage }"
                @click="form.includeCoverPage = !form.includeCoverPage"
              >
                <span class="toggle-switch__thumb" />
              </button>
            </div>
          </div>

          <div class="fmt-field">
            <label class="fmt-field__label">{{ t('fmt.confidentiality_footer') }}</label>
            <input
              v-model="form.confidentialityFooter"
              type="text"
              class="fmt-input"
              :placeholder="t('fmt.confidentiality_footer_placeholder')"
            />
            <span class="fmt-field__hint">{{ t('fmt.confidentiality_footer_hint') }}</span>
          </div>
        </section>

      </div>

      <!-- Right: live preview -->
      <div class="tpl-fmt__preview">
        <div class="preview-label">
          <Icon name="lucide:eye" :size="13" />
          {{ t('fmt.preview_label') }}
        </div>

        <div class="preview-doc" :style="{ '--preview-accent': accentPreview }">

          <!-- Cover page preview (if enabled) -->
          <div v-if="form.includeCoverPage" class="preview-cover">
            <div class="preview-cover__accent-bar" />
            <div v-if="logoPreview" class="preview-cover__logo-wrap">
              <img :src="logoPreview" class="preview-cover__logo" alt="logo" />
            </div>
            <div class="preview-cover__title">{{ form.templateName }}</div>
            <div class="preview-cover__meta">
              <span>Sunset Heights</span>
              <span>Officer: J. Smith</span>
              <span>{{ todayFormatted }}</span>
            </div>
          </div>

          <!-- Report header preview -->
          <div
            class="preview-header"
            :class="{
              'preview-header--compact':     form.headerLayout === 'compact',
              'preview-header--standard':    form.headerLayout === 'standard',
              'preview-header--full-banner': form.headerLayout === 'full_banner',
            }"
          >
            <div v-if="logoPreview" class="preview-header__logo-wrap">
              <img :src="logoPreview" class="preview-header__logo" alt="logo" />
            </div>
            <div v-else class="preview-header__logo-placeholder">LOGO</div>
            <div class="preview-header__text">
              <div class="preview-header__report-title">{{ form.templateName }}</div>
              <div class="preview-header__meta">Sunset Heights · {{ todayFormatted }} · J. Smith</div>
            </div>
          </div>

          <!-- Section preview -->
          <div class="preview-section">
            <div class="preview-section__heading">Incident Details</div>
            <div class="preview-field-row">
              <span class="preview-field__label">Incident Type</span>
              <span class="preview-field__value">Trespassing</span>
            </div>
            <div class="preview-field-row">
              <span class="preview-field__label">Date & Time</span>
              <span class="preview-field__value">{{ todayFormatted }}, 14:32</span>
            </div>
            <div class="preview-field-row">
              <span class="preview-field__label">Location</span>
              <span class="preview-field__value">Gate B, North Entrance</span>
            </div>
          </div>

          <div v-if="form.sectionBreaks === 'new_page'" class="preview-page-break">
            <span>— page break —</span>
          </div>
          <div v-else class="preview-section-divider" />

          <div class="preview-section">
            <div class="preview-section__heading">Narrative</div>
            <div class="preview-field-row preview-field-row--full">
              <span class="preview-field__value">At approximately 14:32, the officer observed an individual attempting to climb the perimeter fence at Gate B...</span>
            </div>
          </div>

          <!-- Footer preview -->
          <div class="preview-footer">
            <span class="preview-footer__confidential">{{ form.confidentialityFooter || '' }}</span>
            <span v-if="form.pageNumbering" class="preview-footer__page">Page 1 of 3</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* ── Layout ── */
.tpl-fmt {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* ── Page Header ── */
.tpl-fmt__page-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-surface);
  flex-shrink: 0;
}
.back-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  flex-shrink: 0;
  transition: all var(--transition-base);
}
.back-btn:hover { border-color: var(--color-accent); color: var(--color-accent); }

.tpl-fmt__page-title-area { flex: 1; }
.tpl-fmt__page-title { font-size: var(--font-size-lg); font-weight: 700; color: var(--color-text-primary); margin: 0; }
.tpl-fmt__page-sub { font-size: var(--font-size-xs); color: var(--color-text-muted); margin: 0; }

.tpl-fmt__header-actions { display: flex; gap: var(--space-2); }

/* ── Body split ── */
.tpl-fmt__body {
  display: grid;
  grid-template-columns: 420px 1fr;
  flex: 1;
  overflow: hidden;
}

/* ── Settings panel ── */
.tpl-fmt__settings {
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-5);
  background: var(--color-bg-elevated);
}

.fmt-section {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.fmt-section__title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.fmt-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.fmt-field__label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}
.fmt-field__hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

/* ── Logo upload ── */
.logo-upload-area {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color var(--transition-base);
  overflow: hidden;
  min-height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.logo-upload-area:hover { border-color: var(--color-accent); }

.logo-upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-4);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
.upload-icon { opacity: 0.4; }
.logo-upload-sub { font-size: var(--font-size-xs); }

.logo-preview-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-3);
}
.logo-preview-img { max-height: 60px; max-width: 180px; object-fit: contain; }
.logo-remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  border: none;
  color: white;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: background var(--transition-base);
}
.logo-remove-btn:hover { background: var(--color-critical); }

/* ── Colour ── */
.colour-row { display: flex; flex-direction: column; gap: var(--space-3); }
.colour-input-wrap { display: flex; align-items: center; gap: var(--space-3); }
.colour-picker {
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 2px;
  cursor: pointer;
  background: none;
}
.colour-hex-input {
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-family: monospace;
  width: 110px;
  outline: none;
}
.colour-hex-input:focus { border-color: var(--color-accent); }

.colour-presets { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.colour-preset {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: border-color var(--transition-base), transform var(--transition-base);
}
.colour-preset:hover { transform: scale(1.15); }
.colour-preset--active { border-color: var(--color-text-primary); }

/* ── Layout cards ── */
.layout-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
}
.layout-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-base);
  cursor: pointer;
  text-align: center;
  transition: all var(--transition-base);
}
.layout-card:hover { border-color: var(--color-accent); }
.layout-card--active {
  border-color: var(--color-accent);
  background: rgba(var(--color-accent-rgb, 59,130,246), 0.08);
}
.layout-card__label { font-size: var(--font-size-xs); font-weight: 600; color: var(--color-text-primary); }
.layout-card__desc { font-size: 10px; color: var(--color-text-muted); line-height: 1.3; }

/* ── Select ── */
.fmt-select {
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  outline: none;
  cursor: pointer;
}
.fmt-select:focus { border-color: var(--color-accent); }

/* ── Input ── */
.fmt-input {
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  outline: none;
  font-family: var(--font-family);
  transition: border-color var(--transition-base);
}
.fmt-input:focus { border-color: var(--color-accent); }
.fmt-input::placeholder { color: var(--color-text-muted); }

/* ── Segmented date format ── */
.segmented-group { display: flex; }
.segmented-btn {
  flex: 1;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  background: var(--color-bg-base);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-family: monospace;
  cursor: pointer;
  transition: all var(--transition-base);
}
.segmented-btn:first-child { border-radius: var(--radius-md) 0 0 var(--radius-md); }
.segmented-btn:last-child  { border-radius: 0 var(--radius-md) var(--radius-md) 0; }
.segmented-btn:not(:first-child) { margin-left: -1px; }
.segmented-btn:hover { z-index: 1; border-color: var(--color-accent); color: var(--color-accent); }
.segmented-btn--active {
  z-index: 1;
  border-color: var(--color-accent);
  background: rgba(var(--color-accent-rgb, 59,130,246), 0.1);
  color: var(--color-accent);
  font-weight: 600;
}

/* ── Radio group ── */
.radio-group { display: flex; flex-direction: column; gap: var(--space-1); }
.radio-option {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
  background: var(--color-bg-base);
}
.radio-option:hover { border-color: var(--color-accent); }
.radio-option--active { border-color: var(--color-accent); background: rgba(var(--color-accent-rgb, 59,130,246), 0.06); }

.radio-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  flex-shrink: 0;
  margin-top: 2px;
  transition: all var(--transition-base);
  position: relative;
}
.radio-dot--on {
  border-color: var(--color-accent);
  background: var(--color-accent);
  box-shadow: inset 0 0 0 3px var(--color-bg-base);
}
.radio-option__text { display: flex; flex-direction: column; gap: 2px; }
.radio-option__label { font-size: var(--font-size-sm); font-weight: 500; color: var(--color-text-primary); }
.radio-option__desc  { font-size: var(--font-size-xs); color: var(--color-text-muted); }

/* ── Toggle list ── */
.toggle-list {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-base);
  border-bottom: 1px solid var(--color-border);
}
.toggle-row:last-child { border-bottom: none; }
.toggle-row__info { display: flex; flex-direction: column; gap: 2px; }
.toggle-row__label { font-size: var(--font-size-sm); font-weight: 500; color: var(--color-text-primary); }
.toggle-row__desc  { font-size: var(--font-size-xs); color: var(--color-text-muted); }

.toggle-switch {
  width: 40px; height: 22px;
  border-radius: 11px;
  background: var(--color-border);
  border: none; cursor: pointer;
  position: relative; flex-shrink: 0;
  transition: background var(--transition-base);
  padding: 0;
}
.toggle-switch--on { background: var(--color-accent); }
.toggle-switch__thumb {
  position: absolute; top: 3px; left: 3px;
  width: 16px; height: 16px; border-radius: 50%;
  background: white;
  transition: transform var(--transition-base);
  box-shadow: 0 1px 3px rgba(0,0,0,0.25);
}
.toggle-switch--on .toggle-switch__thumb { transform: translateX(18px); }

/* ── Preview panel ── */
.tpl-fmt__preview {
  overflow-y: auto;
  background: #1a1a2e;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-6);
  gap: var(--space-3);
}

.preview-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-xs);
  font-weight: 500;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  align-self: flex-start;
}

/* ── Doc preview ── */
.preview-doc {
  background: white;
  width: 100%;
  max-width: 540px;
  border-radius: 4px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.5);
  overflow: hidden;
  font-family: Arial, sans-serif;
  color: #1e293b;
  font-size: 12px;
}

/* ── Cover page ── */
.preview-cover {
  background: white;
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  border-bottom: 3px solid var(--preview-accent);
}
.preview-cover__accent-bar {
  width: 100%;
  height: 6px;
  background: var(--preview-accent);
  border-radius: 3px;
}
.preview-cover__logo-wrap { display: flex; justify-content: center; }
.preview-cover__logo { max-height: 50px; max-width: 150px; object-fit: contain; }
.preview-cover__title {
  font-size: 18px;
  font-weight: 700;
  color: var(--preview-accent);
  text-align: center;
}
.preview-cover__meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #64748b;
}

/* ── Header layouts ── */
.preview-header {
  padding: 12px 16px;
  border-bottom: 3px solid var(--preview-accent);
  display: flex;
  align-items: center;
  gap: 12px;
}
.preview-header--compact { flex-direction: row; }
.preview-header--standard { flex-direction: row; align-items: flex-start; padding: 14px 16px; }
.preview-header--full-banner {
  flex-direction: column;
  align-items: center;
  background: var(--preview-accent);
  padding: 18px 16px;
}
.preview-header--full-banner .preview-header__text { text-align: center; }
.preview-header--full-banner .preview-header__report-title { color: white; }
.preview-header--full-banner .preview-header__meta { color: rgba(255,255,255,0.75); }
.preview-header--full-banner .preview-header__logo-placeholder {
  background: rgba(255,255,255,0.2);
  color: white;
}

.preview-header__logo-wrap { flex-shrink: 0; }
.preview-header__logo { max-height: 36px; max-width: 100px; object-fit: contain; }
.preview-header__logo-placeholder {
  width: 60px;
  height: 28px;
  background: #f1f5f9;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}
.preview-header__report-title { font-size: 13px; font-weight: 700; color: #1e293b; }
.preview-header__meta { font-size: 10px; color: #64748b; margin-top: 2px; }

/* ── Sections ── */
.preview-section { padding: 14px 16px; }
.preview-section__heading {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: white;
  background: var(--preview-accent);
  padding: 4px 10px;
  border-radius: 2px;
  margin-bottom: 10px;
  display: inline-block;
}

.preview-field-row {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 6px;
  padding: 4px 0;
  border-bottom: 1px solid #f1f5f9;
}
.preview-field-row--full { grid-template-columns: 1fr; }
.preview-field__label { font-size: 10px; font-weight: 600; color: #64748b; }
.preview-field__value { font-size: 11px; color: #1e293b; }

.preview-section-divider {
  height: 1px;
  background: var(--preview-accent);
  opacity: 0.25;
  margin: 0 16px;
}
.preview-page-break {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  color: #94a3b8;
  font-style: italic;
  padding: 6px 16px;
  border-top: 1px dashed #e2e8f0;
  border-bottom: 1px dashed #e2e8f0;
  background: #f8fafc;
  letter-spacing: 0.05em;
}

/* ── Footer ── */
.preview-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-top: 1px solid #e2e8f0;
  font-size: 9px;
  color: #94a3b8;
  background: #f8fafc;
  min-height: 26px;
}
.preview-footer__confidential { flex: 1; font-style: italic; }
.preview-footer__page { font-weight: 600; color: #64748b; }

/* ── Action buttons ── */
.btn-cancel {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  transition: all var(--transition-base);
}
.btn-cancel:hover { border-color: var(--color-text-secondary); color: var(--color-text-primary); }

.btn-save {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  background: var(--color-accent);
  border: none;
  color: white;
  transition: opacity var(--transition-base);
}
.btn-save:hover { opacity: 0.88; }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }

/* ── Spin ── */
.spin { animation: spin 1s linear infinite; }
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>
