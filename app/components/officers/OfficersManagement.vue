<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import ImageUpload from '~/components/ImageUpload.vue'
import { officerApi } from '~/api/officer'
import { communityApi } from '~/api/community'
import type { Officer as ApiOfficer } from '~/api/types/officer'
import { useToastStore } from '~/stores/toast'

const props = defineProps<{
  communityId?: string
  communityName?: string
}>()

const { t } = useTranslation()
const toastStore = useToastStore()

// Types
interface OfficerEvaluation {
  evaluation_id: number
  text: string
  date: string
  evaluator_name: string
}

interface Officer {
  id: string
  fullName: string
  community: string
  communityId: number
  mobile: string
  email: string
  address: string
  title: string
  picture: string
  description: string
  registrationDate: string
  lastLogin: string | null
  roles: string[]
  certifications: string[]
  evaluations: OfficerEvaluation[]
  active: boolean
}

interface OfficerForm {
  firstName: string
  lastName: string
  community: string
  communityId: number
  mobile: string
  email: string
  address: string
  title: string
  picture: string
  description: string
  roles: string[]
  certifications: string[]
  active: boolean
}

function mapApiOfficer(o: ApiOfficer): Officer {
  return {
    id: o.user_id,
    fullName: [o.first_name, o.last_name].filter(Boolean).join(' '),
    community: o.community_name || '',
    communityId: o.community_id,
    mobile: o.phone_num,
    email: (o.email && !o.email.endsWith('@placeholder.local')) ? o.email : '',
    address: o.address || '',
    title: o.title,
    picture: o.image_url || '',
    description: o.description || '',
    registrationDate: o.created_on ? o.created_on.split(' ')[0]! : '',
    lastLogin: o.last_login,
    roles: o.roles || [],
    certifications: o.certification_badges || [],
    evaluations: [],
    active: o.is_active,
  }
}

// Constants
const ROLES = ['Patrol', 'Supervisor', 'K9 Handler', 'Traffic Control', 'Dispatcher', 'CCTV Operator']
const CERTIFICATIONS = ['First Aid', 'Firearms', 'Defensive Driving', 'Crisis Management', 'CPR']

// Officers data
const officers = ref<Officer[]>([])
const totalCount = ref(0)
const isLoadingOfficers = ref(false)
const isSearching = ref(false)
const loadError = ref('')

// Communities
const communities = ref<{ community_id: number; name: string }[]>([])
const isLoadingCommunities = ref(false)

// Filters (server-side)
const searchQuery = ref('')
const filterCommunity = ref<number | 'all'>('all')
const filterActive = ref<'all' | 'active' | 'inactive'>('active')
const sortBy = ref<'first_name' | 'last_name' | 'community' | 'created_on' | ''>('')
const sortDir = ref<'asc' | 'desc' | ''>('')

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

const filteredOfficers = computed((): Officer[] => officers.value)

// Add/Edit modal
const showFormModal = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const editingId = ref<string | null>(null)
const editingOriginal = ref<OfficerForm | null>(null)
const showDeleteModal = ref(false)
const showCannotDeleteModal = ref(false)
const deleteTarget = ref<Officer | null>(null)
const isDeleting = ref(false)
const isDeactivating = ref(false)

// Edit modal tab
const editTab = ref<'details' | 'evaluations'>('details')

// Detail view modal
const showDetailModal = ref(false)
const detailOfficer = ref<Officer | null>(null)

// Inline evaluation form (inside edit modal)
const showInlineEvalForm = ref(false)
const isSavingEval = ref(false)
const isLoadingEvals = ref(false)
const inlineEvalForm = reactive({ text: '', date: '' })
const inlineEvalError = ref('')

// Deactivate warning
const deactivateWarning = computed((): boolean =>
  formMode.value === 'edit' &&
  !!editingOriginal.value &&
  editingOriginal.value.active === true &&
  form.active === false
)

// Phone change warning
const showPhoneConfirm = ref(false)
const phoneChanged = computed((): boolean =>
  formMode.value === 'edit' &&
  !!editingOriginal.value &&
  form.mobile.trim() !== '' &&
  form.mobile !== editingOriginal.value.mobile
)

// Eval delete confirmation
const showEvalDeleteModal = ref(false)
const evalDeleteTarget = ref<{ officerId: string; evaluationId: number } | null>(null)

function blankForm(): OfficerForm {
  return {
    firstName: '', lastName: '', community: '', communityId: 0, mobile: '', email: '', address: '',
    title: '', picture: '', description: '', roles: [], certifications: [], active: true,
  }
}

const form = reactive<OfficerForm>(blankForm())
const formErrors = reactive<Record<string, string>>({})
const isSaving = ref(false)

const isFormHasChanged = computed((): boolean => {
  if (formMode.value !== 'edit' || !editingOriginal.value) return true
  const orig = editingOriginal.value
  if (form.firstName.trim() !== (orig.firstName || '')) return true
  if (form.lastName.trim() !== (orig.lastName || '')) return true
  if (form.mobile !== (orig.mobile || '')) return true
  if (form.email !== (orig.email || '')) return true
  if (form.communityId !== (orig.communityId || 0)) return true
  if (form.title !== (orig.title || '')) return true
  if (form.address !== (orig.address || '')) return true
  if (form.description !== (orig.description || '')) return true
  if (form.active !== (orig.active ?? true)) return true
  if (JSON.stringify(form.roles) !== JSON.stringify(orig.roles || [])) return true
  if (JSON.stringify(form.certifications) !== JSON.stringify(orig.certifications || [])) return true
  if (form.picture !== (orig.picture || '') && form.picture.startsWith('data:')) return true
  if (!form.picture && orig.picture) return true
  return false
})

async function loadCommunities() {
  isLoadingCommunities.value = true
  try {
    const response = await communityApi.getCommunities({ include_inactive: false })
    if (response.rc === 0 && response.communities) {
      communities.value = response.communities.map((c: { community_id: number; name: string }) => ({ community_id: c.community_id, name: c.name }))
    }
  } catch (err) {
    console.error('Failed to load communities:', err)
  } finally {
    isLoadingCommunities.value = false
  }
}

async function fetchOfficers(isSearch = false) {
  if (isSearch) isSearching.value = true
  else isLoadingOfficers.value = true
  loadError.value = ''
  try {
    const params: Record<string, unknown> = {}

    // Community filter: props.communityId takes priority, then filter dropdown
    if (props.communityId) {
      params.community_id = Number(props.communityId)
    } else if (filterCommunity.value !== 'all') {
      params.community_id = filterCommunity.value
    }

    // Active filter
    if (filterActive.value === 'all') {
      params.include_inactive = true
    } else if (filterActive.value === 'inactive') {
      params.include_inactive = true
    }
    // 'active' = default server behavior (only active)

    // Search
    if (searchQuery.value.trim()) {
      params.search_text = searchQuery.value.trim()
    }

    // Sort
    if (sortBy.value) {
      params.sort_by = sortBy.value
      params.sort_dir = sortDir.value || 'asc'
    }

    const response = await officerApi.getOfficers(params as any, { showLoading: !isSearch })
    if (response.rc === 0 && response.officers) {
      let mapped = response.officers.map(mapApiOfficer)
      // Client-side post-filter for 'inactive' since API only has include_inactive
      if (filterActive.value === 'inactive') {
        mapped = mapped.filter((o: Officer) => !o.active)
      }
      officers.value = mapped
      totalCount.value = response.total_count ?? mapped.length
    } else {
      loadError.value = response.message || t('officers.load_failed')
      officers.value = []
      totalCount.value = 0
    }
  } catch (err) {
    console.error('Failed to load officers:', err)
    loadError.value = t('officers.load_failed')
    officers.value = []
    totalCount.value = 0
  } finally {
    if (isSearch) isSearching.value = false
    else isLoadingOfficers.value = false
  }
}

// Combined debounced watcher — search + filters
watch([searchQuery, filterCommunity, filterActive, sortBy, sortDir], () => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    fetchOfficers(true)
  }, 400)
})

onMounted(() => {
  loadCommunities()
  fetchOfficers()
})

function openAdd() {
  formMode.value = 'add'
  editingId.value = null
  editTab.value = 'details'
  Object.assign(form, blankForm())
  formErrors.firstName = ''
  formErrors.community = ''
  formErrors.mobile = ''
  formErrors.title = ''
  showFormModal.value = true
}

function populateEditForm(officer: Officer) {
  const nameParts = officer.fullName.split(' ')
  const snapshot: OfficerForm = {
    firstName: nameParts[0] || '', lastName: nameParts.slice(1).join(' ') || '',
    community: officer.community, communityId: officer.communityId, mobile: officer.mobile,
    email: officer.email, address: officer.address, title: officer.title,
    picture: officer.picture, description: officer.description,
    roles: [...officer.roles], certifications: [...officer.certifications], active: officer.active,
  }
  editingOriginal.value = { ...snapshot, roles: [...snapshot.roles], certifications: [...snapshot.certifications] }
  Object.assign(form, snapshot)
  formErrors.firstName = ''
  formErrors.community = ''
  formErrors.mobile = ''
  formErrors.title = ''
}

async function openEdit(officer: Officer) {
  formMode.value = 'edit'
  editingId.value = officer.id
  editTab.value = 'details'
  populateEditForm(officer)
  showFormModal.value = true
  try {
    const response = await officerApi.getOfficer(officer.id)
    if (response.rc === 0 && response.officer) {
      const full = mapApiOfficer(response.officer)
      full.evaluations = (response.officer.evaluations || []).map((e: any) => ({
        evaluation_id: e.evaluation_id,
        text: e.text,
        date: e.date,
        evaluator_name: e.evaluator_name || '',
      }))
      const idx = officers.value.findIndex((o: Officer) => o.id === officer.id)
      if (idx > -1) officers.value[idx] = full
      populateEditForm(full)
    }
  } catch (err) {
    console.error('Error loading officer details:', err)
  }
}

function stripDataUrlPrefix(dataUrl: string): string {
  if (dataUrl.startsWith('data:')) {
    return dataUrl.split(',')[1] || ''
  }
  return dataUrl
}

function validateForm(): boolean {
  formErrors.firstName = !form.firstName.trim() ? t('validation.required') : ''
  formErrors.community = !form.communityId ? t('validation.required') : ''
  formErrors.mobile = !form.mobile.trim() ? t('validation.required') : ''
  formErrors.title = !form.title.trim() ? t('validation.required') : ''
  return !formErrors.firstName && !formErrors.community && !formErrors.mobile && !formErrors.title
}

async function handleSave() {
  if (!validateForm()) return

  // If editing and phone changed → show confirmation first
  if (formMode.value === 'edit' && phoneChanged.value) {
    showPhoneConfirm.value = true
    return
  }

  await doSave()
}

async function doSave() {
  if (formMode.value === 'add') {
    isSaving.value = true
    try {
      const imageBase64 = stripDataUrlPrefix(form.picture)

      const response = await officerApi.addOfficer({
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim() || undefined,
        phone_num: form.mobile,
        email: form.email || undefined,
        community_id: form.communityId,
        title: form.title,
        address: form.address || undefined,
        description: form.description || undefined,
        image: imageBase64 || undefined,
        roles: form.roles.length ? form.roles : undefined,
        certification_badges: form.certifications.length ? form.certifications : undefined,
      })

      if (response.rc === 0) {
        showFormModal.value = false
        toastStore.success(t('officers.create_success'))
        await fetchOfficers()
      } else {
        // Map common error codes to fields
        if (response.rc === 235) {
          formErrors.email = response.message || t('validation.invalid_email')
        } else if (response.rc === 240) {
          formErrors.email = response.message || t('users.email_already_exists')
        } else if (response.rc === 241) {
          formErrors.mobile = response.message || t('validation.phone_already_exists')
        } else if (response.rc === 242) {
          // 242 is password criteria error, not applicable for add_officer
          formErrors.title = response.message || t('officers.create_failed')
        } else if (response.rc === 504 || response.rc === 505) {
          formErrors.community = response.message || t('officers.community_invalid')
        } else if (response.rc === 521) {
          formErrors.mobile = response.message || t('officers.officer_already_in_community')
        } else {
          formErrors.title = response.message || t('officers.create_failed')
        }
      }
    } catch (err) {
      console.error('Error creating officer:', err)
      formErrors.title = t('officers.create_failed')
    } finally {
      isSaving.value = false
    }
    return
  }

  if (formMode.value === 'edit' && editingId.value) {
    isSaving.value = true
    try {
      const orig = editingOriginal.value

      // Build partial update payload — only changed fields
      const payload: Record<string, unknown> = { user_id: editingId.value }

      if (form.firstName.trim() !== (orig?.firstName || '')) payload.first_name = form.firstName.trim()
      if (form.lastName.trim() !== (orig?.lastName || '')) payload.last_name = form.lastName.trim()
      if (form.mobile !== (orig?.mobile || '')) payload.phone_num = form.mobile
      if (form.email !== (orig?.email || '')) payload.email = form.email || ''
      if (form.communityId !== (orig?.communityId || 0)) payload.community_id = form.communityId
      if (form.title !== (orig?.title || '')) payload.title = form.title
      if (form.address !== (orig?.address || '')) payload.address = form.address
      if (form.description !== (orig?.description || '')) payload.description = form.description
      if (form.active !== (orig?.active ?? true)) payload.is_active = form.active

      // Arrays: always send if different
      if (JSON.stringify(form.roles) !== JSON.stringify(orig?.roles || [])) {
        payload.roles = form.roles
      }
      if (JSON.stringify(form.certifications) !== JSON.stringify(orig?.certifications || [])) {
        payload.certification_badges = form.certifications
      }

      // Image: only send if user selected a new file (data URL) or cleared
      if (form.picture !== (orig?.picture || '')) {
        if (!form.picture) {
          // User removed the image
          payload.image = ''
        } else if (form.picture.startsWith('data:')) {
          // User selected a new image
          payload.image = stripDataUrlPrefix(form.picture)
        }
        // If picture is still an http URL (unchanged), skip
      }

      const response = await officerApi.updateOfficer(payload as any)

      if (response.rc === 0) {
        showFormModal.value = false
        await fetchOfficers()
      } else {
        if (response.rc === 520) {
          formErrors.title = response.message || t('officers.officer_not_found')
          showFormModal.value = false
          await fetchOfficers()
        } else if (response.rc === 235) {
          formErrors.email = response.message || t('validation.invalid_email')
        } else if (response.rc === 240) {
          formErrors.email = response.message || t('users.email_already_exists')
        } else if (response.rc === 241) {
          formErrors.mobile = response.message || t('validation.phone_already_exists')
        } else if (response.rc === 504 || response.rc === 505) {
          formErrors.community = response.message || t('officers.community_invalid')
        } else if (response.rc === 521) {
          formErrors.mobile = response.message || t('officers.officer_already_in_community')
        } else {
          formErrors.title = response.message || t('officers.update_failed')
        }
      }
    } catch (err) {
      console.error('Error updating officer:', err)
      formErrors.title = t('officers.update_failed')
    } finally {
      isSaving.value = false
    }
  }
}

function confirmDelete(officer: Officer) {
  deleteTarget.value = officer
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!deleteTarget.value) return
  isDeleting.value = true
  try {
    const response = await officerApi.deleteOfficer(deleteTarget.value.id)
    if (response.rc === 0) {
      showDeleteModal.value = false
      toastStore.success(t('officers.delete_success'))
      deleteTarget.value = null
      await fetchOfficers()
    } else if (response.rc === 526) {
      showDeleteModal.value = false
      showCannotDeleteModal.value = true
    } else if (response.rc === 520) {
      showDeleteModal.value = false
      toastStore.info(t('officers.officer_not_found'))
      deleteTarget.value = null
      await fetchOfficers()
    } else {
      showDeleteModal.value = false
      toastStore.error(response.message || t('officers.delete_failed'))
      deleteTarget.value = null
    }
  } catch (err) {
    console.error('Error deleting officer:', err)
    toastStore.error(t('officers.delete_failed'))
    showDeleteModal.value = false
  } finally {
    isDeleting.value = false
  }
}

async function handleDeactivateFromDelete() {
  if (!deleteTarget.value) return
  isDeactivating.value = true
  try {
    const response = await officerApi.updateOfficer({ user_id: deleteTarget.value.id, is_active: false })
    if (response.rc === 0) {
      showCannotDeleteModal.value = false
      toastStore.success(t('officers.deactivate_success'))
      deleteTarget.value = null
      await fetchOfficers()
    } else {
      toastStore.error(response.message || t('officers.update_failed'))
    }
  } catch (err) {
    console.error('Error deactivating officer:', err)
    toastStore.error(t('officers.update_failed'))
  } finally {
    isDeactivating.value = false
  }
}

async function openDetail(officer: Officer) {
  detailOfficer.value = officer
  showDetailModal.value = true
  try {
    const response = await officerApi.getOfficer(officer.id)
    if (response.rc === 0 && response.officer) {
      const full = mapApiOfficer(response.officer)
      full.evaluations = (response.officer.evaluations || []).map((e: any) => ({
        evaluation_id: e.evaluation_id,
        text: e.text,
        date: e.date,
        evaluator_name: e.evaluator_name || '',
      }))
      const idx = officers.value.findIndex((o: Officer) => o.id === officer.id)
      if (idx > -1) officers.value[idx] = full
      detailOfficer.value = full
    }
  } catch (err) {
    console.error('Error loading officer details:', err)
  }
}

function toggleRole(role: string) {
  const idx = form.roles.indexOf(role)
  if (idx > -1) form.roles.splice(idx, 1)
  else form.roles.push(role)
}

function toggleCert(cert: string) {
  const idx = form.certifications.indexOf(cert)
  if (idx > -1) form.certifications.splice(idx, 1)
  else form.certifications.push(cert)
}

function handlePhotoChange(event: Event) {
  // This function is no longer used - ImageUpload handles its own events
}

async function openEvaluationsTab() {
  if (!editingId.value) return
  editTab.value = 'evaluations'
  const officer = officers.value.find((o: Officer) => o.id === editingId.value)
  if (!officer) return
  isLoadingEvals.value = true
  try {
    const response = await officerApi.getOfficerEvaluations(editingId.value)
    if (response.rc === 0 && response.evaluations) {
      officer.evaluations = response.evaluations.map((e: any) => ({
        evaluation_id: e.evaluation_id,
        text: e.text,
        date: e.date,
        evaluator_name: e.evaluator_name || '',
      }))
    }
  } catch (err) {
    console.error('Error loading evaluations:', err)
  } finally {
    isLoadingEvals.value = false
  }
}

function openInlineEvalForm() {
  inlineEvalForm.text = ''
  inlineEvalForm.date = new Date().toISOString().split('T')[0]!
  inlineEvalError.value = ''
  showInlineEvalForm.value = true
}

function cancelInlineEvalForm() {
  showInlineEvalForm.value = false
  inlineEvalError.value = ''
}

function confirmDeleteEval(officerId: string | null, evaluationId: number) {
  if (!officerId) return
  evalDeleteTarget.value = { officerId, evaluationId }
  showEvalDeleteModal.value = true
}

async function submitInlineEvalForm() {
  if (!inlineEvalForm.text.trim()) {
    inlineEvalError.value = t('validation.required')
    return
  }
  if (!editingId.value) return
  isSavingEval.value = true
  inlineEvalError.value = ''
  try {
    const response = await officerApi.addOfficerEvaluation({
      user_id: editingId.value,
      text: inlineEvalForm.text.trim(),
      date: inlineEvalForm.date,
    })
    if (response.rc === 0) {
      showInlineEvalForm.value = false
      toastStore.success(t('officers.eval_add_success'))
      // Reload evaluation list from server to get evaluator_name and correct data
      const officer = officers.value.find((o: Officer) => o.id === editingId.value)
      if (officer && editingId.value) {
        isLoadingEvals.value = true
        try {
          const evResponse = await officerApi.getOfficerEvaluations(editingId.value)
          if (evResponse.rc === 0 && evResponse.evaluations) {
            officer.evaluations = evResponse.evaluations.map((e: any) => ({
              evaluation_id: e.evaluation_id,
              text: e.text,
              date: e.date,
              evaluator_name: e.evaluator_name || '',
            }))
          }
        } finally {
          isLoadingEvals.value = false
        }
      }
    } else if (response.rc === 520) {
      inlineEvalError.value = t('officers.officer_not_found')
    } else {
      inlineEvalError.value = response.message || t('officers.eval_add_failed')
    }
  } catch (err) {
    console.error('Error adding evaluation:', err)
    inlineEvalError.value = t('officers.eval_add_failed')
  } finally {
    isSavingEval.value = false
  }
}

// Evaluations list for currently editing officer — sorted newest first
const evalList = computed((): OfficerEvaluation[] => {
  if (!editingId.value) return []
  const officer = officers.value.find((o: Officer) => o.id === editingId.value)
  return [...(officer?.evaluations ?? [])].sort((a, b) => b.date.localeCompare(a.date))
})

function formatEvalDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

async function handleDeleteEval() {
  if (!evalDeleteTarget.value) return
  const { officerId, evaluationId } = evalDeleteTarget.value
  showEvalDeleteModal.value = false
  evalDeleteTarget.value = null
  try {
    const response = await officerApi.deleteOfficerEvaluation(evaluationId)
    if (response.rc === 0 || response.rc === 527) {
      const officer = officers.value.find((o: Officer) => o.id === officerId)
      if (officer) {
        officer.evaluations = officer.evaluations.filter((e: OfficerEvaluation) => e.evaluation_id !== evaluationId)
      }
      if (response.rc === 527) {
        toastStore.info(t('officers.eval_not_found'))
      }
    }
  } catch (err) {
    console.error('Error deleting evaluation:', err)
  }
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function toggleSort(col: 'first_name' | 'last_name' | 'community' | 'created_on') {
  if (sortBy.value === col) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = col
    sortDir.value = 'asc'
  }
}
</script>

<template>
  <div class="officers-management">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <span class="total-count">{{ t('officers.total', { count: String(totalCount) }) }}</span>
      </div>
      <div class="header-actions">
        <AppButton :text="t('officers.add_officer')" type="primary" icon="lucide:plus" @click="openAdd" />
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <div class="search-box">
        <Icon name="lucide:search" :size="14" />
        <input v-model="searchQuery" type="text" :placeholder="t('officers.search_placeholder')" />
        <Icon v-if="isSearching" name="lucide:loader-2" :size="14" class="animate-spin search-spinner" />
        <button v-if="searchQuery" class="search-clear-btn" @click="searchQuery = ''">
          <Icon name="lucide:x" :size="12" />
        </button>
      </div>

      <select v-if="!props.communityName" v-model="filterCommunity" class="filter-select">
        <option value="all">{{ t('officers.all_communities') }}</option>
        <option v-for="c in communities" :key="c.community_id" :value="c.community_id">{{ c.name }}</option>
      </select>

      <div class="filter-toggle">
        <button :class="['ftoggle-btn', { active: filterActive === 'active' }]" @click="filterActive = 'active'">{{ t('common.active') }}</button>
        <button :class="['ftoggle-btn', { active: filterActive === 'inactive' }]" @click="filterActive = 'inactive'">{{ t('common.inactive') }}</button>
        <button :class="['ftoggle-btn', { active: filterActive === 'all' }]" @click="filterActive = 'all'">{{ t('officers.all') }}</button>
      </div>
    </div>

    <!-- Table -->
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th class="sortable" :class="{ 'th--sorted': sortBy === 'first_name' || sortBy === 'last_name' }" @click="toggleSort('first_name')">
              <span class="th-content">
                {{ t('officers.full_name') }}
                <Icon v-if="sortBy === 'first_name'" :name="sortDir === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="12" />
                <Icon v-else name="lucide:chevrons-up-down" :size="12" class="th-sort-idle" />
              </span>
            </th>
            <th v-if="!props.communityName" class="sortable" :class="{ 'th--sorted': sortBy === 'community' }" @click="toggleSort('community')">
              <span class="th-content">
                {{ t('officers.community') }}
                <Icon v-if="sortBy === 'community'" :name="sortDir === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="12" />
                <Icon v-else name="lucide:chevrons-up-down" :size="12" class="th-sort-idle" />
              </span>
            </th>
            <th>{{ t('officers.mobile') }}</th>
            <th>{{ t('officers.title') }}</th>
            <th>{{ t('officers.roles') }}</th>
            <th>{{ t('officers.certifications') }}</th>
            <th class="sortable" :class="{ 'th--sorted': sortBy === 'created_on' }" @click="toggleSort('created_on')">
              <span class="th-content">
                {{ t('officers.reg_date') }}
                <Icon v-if="sortBy === 'created_on'" :name="sortDir === 'asc' ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="12" />
                <Icon v-else name="lucide:chevrons-up-down" :size="12" class="th-sort-idle" />
              </span>
            </th>
            <th>{{ t('officers.active') }}</th>
            <th>{{ t('officers.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoadingOfficers">
            <td colspan="9" class="empty-row">
              <Icon name="lucide:loader-2" :size="16" class="animate-spin" />
              {{ t('common.loading') }}
            </td>
          </tr>
          <tr v-else-if="loadError">
            <td colspan="9" class="empty-row error-row">
              {{ loadError }}
              <button class="retry-btn" @click="() => fetchOfficers()">{{ t('common.retry') }}</button>
            </td>
          </tr>
          <tr v-for="officer in filteredOfficers" :key="officer.id" :class="{ 'row--inactive': !officer.active }">
            <td>
              <div class="officer-name-cell">
                <div v-if="officer.picture" class="avatar">
                  <img :src="officer.picture" :alt="officer.fullName" />
                </div>
                <div v-else class="avatar avatar--initials">{{ getInitials(officer.fullName) }}</div>
                <div>
                  <div class="name-primary">{{ officer.fullName }}</div>
                  <div class="name-secondary">{{ officer.email || '—' }}</div>
                </div>
              </div>
            </td>
            <td v-if="!props.communityName">{{ officer.community }}</td>
            <td class="mono-cell">{{ officer.mobile }}</td>
            <td>{{ officer.title }}</td>
            <td>
              <div class="tags-cell">
                <Badge v-for="role in officer.roles" :key="role" type="officerRole" :value="role" />
                <span v-if="!officer.roles.length" class="muted">—</span>
              </div>
            </td>
            <td>
              <div class="tags-cell">
                <Badge v-for="cert in officer.certifications" :key="cert" type="officerCert" :value="cert" />
                <span v-if="!officer.certifications.length" class="muted">—</span>
              </div>
            </td>
            <td class="muted">{{ officer.registrationDate }}</td>
            <td>
              <div class="tags-cell">
                <Badge type="status" :value="officer.active ? 'active' : 'inactive'" />
                <span v-if="officer.lastLogin === null" class="badge-pending-login">Not yet logged in</span>
              </div>
            </td>
            <td>
              <div class="action-group">
                <button class="action-btn" :title="t('common.view')" @click="openDetail(officer)">
                  <Icon name="lucide:eye" :size="14" />
                </button>
                <button class="action-btn" :title="t('common.edit')" @click="openEdit(officer)">
                  <Icon name="lucide:pencil" :size="14" />
                </button>
                <button class="action-btn action-btn--danger" :title="t('common.delete')" @click="confirmDelete(officer)">
                  <Icon name="lucide:trash-2" :size="14" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!isLoadingOfficers && !loadError && !filteredOfficers.length">
            <td colspan="9" class="empty-row">{{ t('officers.no_officers') }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <AppModal
      :show="showFormModal"
      :title="formMode === 'add' ? t('officers.add_title') : t('officers.edit_title')"
      :cancel-text="editTab === 'evaluations' ? '' : t('common.cancel')"
      :ok-text="editTab === 'evaluations' ? t('common.close') : t('common.save')"
      :ok-disabled="editTab === 'details' && (isSaving || !isFormHasChanged)"
      max-width="50vw"
      @close="showFormModal = false"
      @cancel="showFormModal = false"
      @ok="editTab === 'evaluations' ? (showFormModal = false) : handleSave()"
    >
      <template #default>
        <div class="officer-form">

          <!-- Tab Bar (edit mode only) -->
          <div v-if="formMode === 'edit'" class="modal-tab-bar">
            <button
              :class="['modal-tab-btn', { 'modal-tab-btn--active': editTab === 'details' }]"
              @click="editTab = 'details'"
            >
              {{ t('officers.tab_details') }}
            </button>
            <button
              :class="['modal-tab-btn', { 'modal-tab-btn--active': editTab === 'evaluations' }]"
              @click="openEvaluationsTab"
            >
              {{ t('officers.tab_evaluations') }}
              <span v-if="evalList.length" class="modal-tab-badge">{{ evalList.length }}</span>
            </button>
          </div>
          <!-- Details Tab Panel -->
          <template v-if="formMode === 'add' || editTab === 'details'">

          <!-- Row 1: Photo + Name/Community Block -->
          <div class="form-row-photo-name">
            <!-- Photo on left -->
            <div class="photo-col">
              <ImageUpload
                v-model="form.picture"
                :label="t('officers.photo')"
                :auto-upload="false"
                :preview-size="100"
              />
            </div>
            <!-- Name and Community stacked vertically on right -->
            <div class="name-community-col">
              <div class="form-row-2col">
                <div class="form-field" :class="{ error: formErrors.firstName }">
                  <label class="field-label">{{ t('officers.first_name') }} <span class="required">*</span></label>
                  <input v-model="form.firstName" type="text" class="field-input" :placeholder="t('officers.first_name_placeholder')" />
                  <span v-if="formErrors.firstName" class="error-msg">{{ formErrors.firstName }}</span>
                </div>
                <div class="form-field">
                  <label class="field-label">{{ t('officers.last_name') }}</label>
                  <input v-model="form.lastName" type="text" class="field-input" :placeholder="t('officers.last_name_placeholder')" />
                </div>
              </div>
              <div class="form-field" :class="{ error: formErrors.community }">
                <label class="field-label">{{ t('officers.community') }} <span class="required">*</span></label>
                <select v-model="form.communityId" class="field-select" :disabled="isLoadingCommunities">
                  <option :value="0" disabled>{{ isLoadingCommunities ? t('officers.loading_communities') : t('officers.select_community') }}</option>
                  <option v-for="c in communities" :key="c.community_id" :value="c.community_id">{{ c.name }}</option>
                </select>
                <span v-if="formErrors.community" class="error-msg">{{ formErrors.community }}</span>
              </div>
            </div>
          </div>

          <!-- Row 2: Mobile + Title -->
          <div class="form-row-2col">
            <div class="form-field" :class="{ error: formErrors.mobile }">
              <label class="field-label">{{ t('officers.mobile') }} <span class="required">*</span></label>
              <input v-model="form.mobile" type="tel" class="field-input" :placeholder="t('officers.mobile_placeholder')" />
              <span v-if="formErrors.mobile" class="error-msg">{{ formErrors.mobile }}</span>
              <div v-if="phoneChanged" class="phone-change-warning">
                <Icon name="lucide:alert-triangle" :size="14" class="phone-change-warning__icon" />
                <span>{{ t('officers.phone_change_warning') }}</span>
              </div>
            </div>
            <div class="form-field" :class="{ error: formErrors.title }">
              <label class="field-label">{{ t('officers.title') }} <span class="required">*</span></label>
              <input v-model="form.title" type="text" class="field-input" :placeholder="t('officers.title_placeholder')" />
              <span v-if="formErrors.title" class="error-msg">{{ formErrors.title }}</span>
            </div>
          </div>

          <!-- Row 3: Email + Address -->
          <div class="form-row-2col">
            <div class="form-field">
              <label class="field-label">{{ t('officers.email') }}</label>
              <input v-model="form.email" type="email" class="field-input" :placeholder="t('officers.email_placeholder')" />
            </div>
            <div class="form-field">
              <label class="field-label">{{ t('officers.address') }}</label>
              <input v-model="form.address" type="text" class="field-input" :placeholder="t('officers.address_placeholder')" />
            </div>
          </div>

          <!-- Description -->
          <div class="form-field">
            <label class="field-label">{{ t('officers.description') }}</label>
            <textarea v-model="form.description" class="field-textarea" rows="2" :placeholder="t('officers.description_placeholder')" />
          </div>

          <!-- Roles -->
          <div class="form-field">
            <label class="field-label">{{ t('officers.roles') }}</label>
            <div class="checkbox-group">
              <label v-for="role in ROLES" :key="role" class="checkbox-item">
                <input type="checkbox" :checked="form.roles.includes(role)" @change="toggleRole(role)" />
                <span>{{ role }}</span>
              </label>
            </div>
          </div>

          <!-- Certifications -->
          <div class="form-field">
            <label class="field-label">{{ t('officers.certifications') }}</label>
            <div class="checkbox-group">
              <label v-for="cert in CERTIFICATIONS" :key="cert" class="checkbox-item">
                <input type="checkbox" :checked="form.certifications.includes(cert)" @change="toggleCert(cert)" />
                <span>{{ cert }}</span>
              </label>
            </div>
          </div>

          <!-- Active (edit only) -->
          <div v-if="formMode === 'edit'" class="form-field">
            <label class="field-label">{{ t('officers.active') }}</label>
            <label class="toggle-label">
              <input v-model="form.active" type="checkbox" />
              <span>{{ form.active ? t('common.active') : t('common.inactive') }}</span>
            </label>
            <div v-if="deactivateWarning" class="phone-change-warning">
              <Icon name="lucide:alert-triangle" :size="14" class="phone-change-warning__icon" />
              <span>{{ t('officers.deactivate_warning') }}</span>
            </div>
          </div>

          </template><!-- end details tab -->

          <!-- Evaluations Tab Panel -->
          <div v-if="formMode === 'edit' && editingId && editTab === 'evaluations'" class="eval-section eval-section--tab">
            <div class="eval-header">
              <span class="eval-title">{{ t('officers.evaluations') }}</span>
              <button v-if="!showInlineEvalForm" class="eval-add-btn" @click="openInlineEvalForm">
                <Icon name="lucide:plus" :size="12" />
                {{ t('officers.add_evaluation') }}
              </button>
            </div>

            <!-- Loading state -->
            <div v-if="isLoadingEvals" class="eval-loading">
              <Icon name="lucide:loader-2" :size="18" class="eval-loading__spinner" />
              <span>{{ t('common.loading') }}</span>
            </div>

            <!-- Inline Add Form -->
            <div v-if="!isLoadingEvals && showInlineEvalForm" class="eval-inline-form">
              <div class="form-field" :class="{ error: inlineEvalError }">
                <label class="field-label">{{ t('officers.eval_text') }} <span class="required">*</span></label>
                <textarea v-model="inlineEvalForm.text" class="field-textarea" rows="3" :placeholder="t('officers.eval_text_placeholder')" />
                <span v-if="inlineEvalError" class="error-msg">{{ inlineEvalError }}</span>
              </div>
              <div class="form-field">
                <label class="field-label">{{ t('officers.eval_date') }}</label>
                <input v-model="inlineEvalForm.date" type="date" class="field-input" />
              </div>
              <div class="eval-inline-actions">
                <button class="btn-secondary-sm" :disabled="isSavingEval" @click="cancelInlineEvalForm">{{ t('common.cancel') }}</button>
                <button class="btn-primary-sm" :disabled="isSavingEval" @click="submitInlineEvalForm">{{ isSavingEval ? t('common.saving') : t('common.save') }}</button>
              </div>
            </div>

            <!-- Eval List -->
            <div v-if="!isLoadingEvals && evalList.length" class="eval-list">
              <div v-for="ev in evalList" :key="ev.evaluation_id" class="eval-item">
                <div class="eval-meta">
                  <span class="eval-date">{{ formatEvalDate(ev.date) }}</span>
                  <div class="eval-meta-right">
                    <span class="eval-evaluator">by {{ ev.evaluator_name || t('officers.unknown') }}</span>
                    <button class="eval-delete-btn" :title="t('common.delete')" @click="confirmDeleteEval(editingId, ev.evaluation_id)">
                      <Icon name="lucide:trash-2" :size="13" />
                    </button>
                  </div>
                </div>
                <p class="eval-text">{{ ev.text }}</p>
              </div>
            </div>
            <p v-else-if="!isLoadingEvals && !showInlineEvalForm" class="eval-empty">{{ t('officers.no_evaluations') }}</p>
          </div>
        </div>
      </template>
    </AppModal>

    <!-- Detail Modal -->
    <AppModal
      v-if="detailOfficer"
      :show="showDetailModal"
      :title="detailOfficer.fullName"
      :cancel-text="t('common.close')"
      :ok-text="''"
      @close="showDetailModal = false"
      @cancel="showDetailModal = false"
    >
      <template #default>
        <div class="detail-view">
          <!-- Avatar + basic -->
          <div class="detail-header">
            <div class="detail-avatar">
              <div v-if="detailOfficer.picture" class="avatar avatar--lg">
                <img :src="detailOfficer.picture" :alt="detailOfficer.fullName" />
              </div>
              <div v-else class="avatar avatar--lg avatar--initials">{{ getInitials(detailOfficer.fullName) }}</div>
            </div>
            <div class="detail-header-info">
              <p class="detail-title-text">{{ detailOfficer.title }}</p>
              <p class="detail-community">{{ detailOfficer.community }}</p>
              <Badge type="status" :value="detailOfficer.active ? 'active' : 'inactive'" />
            </div>
          </div>

          <div class="detail-grid">
            <div class="detail-row">
              <span class="detail-label">{{ t('officers.mobile') }}</span>
              <span class="detail-value mono">{{ detailOfficer.mobile }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ t('officers.email') }}</span>
              <span class="detail-value">{{ detailOfficer.email || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ t('officers.address') }}</span>
              <span class="detail-value">{{ detailOfficer.address || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ t('officers.reg_date') }}</span>
              <span class="detail-value mono">{{ detailOfficer.registrationDate }}</span>
            </div>
            <div class="detail-row detail-row--full">
              <span class="detail-label">{{ t('officers.roles') }}</span>
              <div class="tags-cell">
                <Badge v-for="r in detailOfficer.roles" :key="r" type="officerRole" :value="r" />
                <span v-if="!detailOfficer.roles.length" class="muted">—</span>
              </div>
            </div>
            <div class="detail-row detail-row--full">
              <span class="detail-label">{{ t('officers.certifications') }}</span>
              <div class="tags-cell">
                <Badge v-for="c in detailOfficer.certifications" :key="c" type="officerCert" :value="c" />
                <span v-if="!detailOfficer.certifications.length" class="muted">—</span>
              </div>
            </div>
            <div v-if="detailOfficer.description" class="detail-row detail-row--full">
              <span class="detail-label">{{ t('officers.description') }}</span>
              <span class="detail-value">{{ detailOfficer.description }}</span>
            </div>
          </div>

          <!-- Evaluations (read-only in detail view) -->
          <div class="eval-section">
            <div class="eval-header">
              <span class="eval-title">{{ t('officers.evaluations') }}</span>
            </div>
            <div v-if="detailOfficer.evaluations.length" class="eval-list">
              <div v-for="(ev, idx) in detailOfficer.evaluations" :key="idx" class="eval-item">
                <div class="eval-meta">
                  <span class="eval-date">{{ formatEvalDate(ev.date) }}</span>
                  <span class="eval-evaluator">by {{ ev.evaluator_name || t('officers.unknown') }}</span>
                </div>
                <p class="eval-text">{{ ev.text }}</p>
              </div>
            </div>
            <p v-else class="eval-empty">{{ t('officers.no_evaluations') }}</p>
          </div>
        </div>
      </template>
    </AppModal>

    <!-- Phone Change Confirmation -->
    <AppModal
      :show="showPhoneConfirm"
      :title="t('officers.phone_confirm_title')"
      :cancel-text="t('common.cancel')"
      :ok-text="t('common.continue')"
      @close="showPhoneConfirm = false"
      @cancel="showPhoneConfirm = false"
      @ok="showPhoneConfirm = false; doSave()"
    >
      <template #default>
        <p class="modal-confirm-message">{{ t('officers.phone_confirm_message') }}</p>
      </template>
    </AppModal>

    <!-- Delete Eval Confirmation -->
    <AppModal
      :show="showEvalDeleteModal"
      :title="t('officers.delete_eval_title')"
      :cancel-text="t('common.cancel')"
      :ok-text="t('common.delete')"
      @close="showEvalDeleteModal = false"
      @cancel="showEvalDeleteModal = false"
      @ok="handleDeleteEval"
    >
      <template #default>
        <p class="modal-confirm-message">{{ t('officers.delete_eval_message') }}</p>
      </template>
    </AppModal>

    <!-- Delete Confirmation -->
    <AppModal
      :show="showDeleteModal"
      :title="t('officers.delete_title')"
      :cancel-text="t('common.cancel')"
      :ok-text="isDeleting ? t('common.deleting') : t('common.delete')"
      :ok-disabled="isDeleting"
      @close="showDeleteModal = false"
      @cancel="showDeleteModal = false"
      @ok="handleDelete"
    >
      <template #default>
        <p class="modal-confirm-message">{{ t('officers.delete_message', { name: deleteTarget?.fullName ?? '' }) }}</p>
        <p class="modal-confirm-subtext">{{ t('officers.delete_cannot_undo') }}</p>
      </template>
    </AppModal>

    <!-- Cannot Delete Modal (rc: 526) -->
    <AppModal
      :show="showCannotDeleteModal"
      :title="t('officers.cannot_delete_title')"
      :cancel-text="t('common.close')"
      :ok-text="isDeactivating ? t('common.deactivating') : t('officers.deactivate_officer')"
      :ok-disabled="isDeactivating"
      @close="showCannotDeleteModal = false; deleteTarget = null"
      @cancel="showCannotDeleteModal = false; deleteTarget = null"
      @ok="handleDeactivateFromDelete"
    >
      <template #default>
        <p class="modal-confirm-message">{{ t('officers.cannot_delete_message') }}</p>
      </template>
    </AppModal>
  </div>
</template>

<style scoped>
.officers-management {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 100%;
}

/* Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.total-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.header-actions {
  display: flex;
  gap: var(--space-3);
}

/* Filters */
.filters-bar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.search-box {
  /* flex: 1; */
  width: 300px;
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
}

.search-box input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.search-spinner {
  color: var(--color-accent);
  flex-shrink: 0;
}

.search-clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  background: var(--color-bg-overlay);
  border: none;
  border-radius: 50%;
  color: var(--color-text-muted);
  cursor: pointer;
  flex-shrink: 0;
  transition: background var(--transition-base), color var(--transition-base);
}

.search-clear-btn:hover {
  background: var(--color-border);
  color: var(--color-text-primary);
}

.filter-select {
  width: 300px;
  height: 38px;
  padding: 0 var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  outline: none;
  cursor: pointer;
  margin-left: 10px;
  margin-right: 10px;
}

.filter-toggle {
  display: flex;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.ftoggle-btn {
  padding: var(--space-2) var(--space-3);
  background: none;
  border: none;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-base);
}

.ftoggle-btn.active {
  background: var(--color-accent);
  color: var(--color-bg-base);
  font-weight: 500;
}

/* Table */
.table-wrapper {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.data-table th {
  text-align: left;
  padding: var(--space-3);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.data-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.data-table th.sortable:hover {
  color: var(--color-text-primary);
}

.data-table th.th--sorted {
  color: var(--color-accent);
}

.th-content {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.th-sort-idle {
  opacity: 0.35;
}

.data-table td {
  padding: var(--space-3);
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: var(--color-bg-elevated); }
.data-table tr.row--inactive { opacity: 0.6; }

.badge-pending-login {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 600;
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.3);
  white-space: nowrap;
}
.data-table tr.row--inactive:hover td { background: transparent; }

.empty-row {
  text-align: center;
  color: var(--color-text-muted);
  padding: var(--space-8) !important;
  font-style: italic;
}

.error-row {
  color: var(--color-critical);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
}

.retry-btn {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-1) var(--space-3);
  font-size: var(--font-size-xs);
  color: var(--color-accent);
  cursor: pointer;
  margin-left: var(--space-2);
}

.retry-btn:hover {
  background: var(--color-bg-elevated);
}

.modal-confirm-message {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-2);
  line-height: 1.6;
}

.modal-confirm-subtext {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.modal-error-message {
  font-size: var(--font-size-sm);
  color: var(--color-critical);
  margin: 0;
  padding: var(--space-2) var(--space-3);
  background: rgba(239, 68, 68, 0.08);
  border-radius: var(--radius-md);
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Officer name cell */
.officer-name-cell {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar--initials {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-overlay);
  border: 1px solid var(--color-border);
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--color-accent);
}

.avatar--lg {
  width: 56px;
  height: 56px;
  font-size: var(--font-size-base);
}

.name-primary {
  font-weight: 500;
  color: var(--color-text-primary);
}

.name-secondary {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.mono-cell {
  font-family: monospace;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted) !important;
}

/* Tags */
.tags-cell {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.tag {
  display: inline-block;
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.tag--role {
  background: rgba(110, 231, 183, 0.1);
  color: var(--color-accent);
  border: 1px solid rgba(110, 231, 183, 0.3);
}

.tag--cert {
  background: rgba(96, 165, 250, 0.1);
  color: #60a5fa;
  border: 1px solid rgba(96, 165, 250, 0.3);
}

.muted {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}

/* Actions */
.action-group {
  display: flex;
  gap: var(--space-1);
}

.action-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-base);
}

.action-btn:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.action-btn--danger:hover {
  color: var(--color-critical) !important;
  border-color: var(--color-critical) !important;
}

/* Form */
.officer-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

/* Photo + Name/Community row */
.form-row-photo-name {
  display: flex;
  gap: var(--space-4);
  align-items: flex-start;
}

.photo-col {
  flex-shrink: 0;
}

.name-community-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.name-community-col .form-field {
  margin-bottom: 0;
}

.eval-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-width: 420px;
}

.form-row-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.field-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.required { color: var(--color-critical); }

.field-input,
.field-select,
.field-textarea {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  outline: none;
  box-sizing: border-box;
}

.field-select { height: 40px; cursor: pointer; }
.field-textarea { resize: vertical; line-height: 1.5; }

.field-input:focus,
.field-select:focus,
.field-textarea:focus { border-color: var(--color-accent); }

.form-field.error .field-input,
.form-field.error .field-select,
.form-field.error .field-textarea { border-color: var(--color-critical); }

.error-msg { font-size: var(--font-size-xs); color: var(--color-critical); }

.phone-change-warning {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  margin-top: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: color-mix(in srgb, #f59e0b 12%, transparent);
  border: 1px solid color-mix(in srgb, #f59e0b 40%, transparent);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  color: #d97706;
  line-height: 1.5;
}

.phone-change-warning__icon {
  flex-shrink: 0;
  margin-top: 1px;
  color: #f59e0b;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
}

.checkbox-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--color-accent);
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: 40px;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  cursor: pointer;
}

.toggle-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--color-accent);
}

/* Detail view */
.detail-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-width: 480px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.detail-header-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.detail-title-text {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.detail-community {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border);
}

.detail-row--full {
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-1);
}

.detail-row:last-child { border-bottom: none; }

.detail-label {
  min-width: 130px;
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.detail-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.detail-value.mono {
  font-family: monospace;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

/* Modal Tab Bar */
.modal-tab-bar {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--space-4);
}

.modal-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-4);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  margin-bottom: -1px;
  transition: color var(--transition-base), border-color var(--transition-base);
}

.modal-tab-btn:hover {
  color: var(--color-text-primary);
}

.modal-tab-btn--active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
  font-weight: 600;
}

.modal-tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: var(--color-accent);
  border-radius: 9px;
  color: #0a0c10;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
}

.eval-section--tab {
  border-top: none;
  padding-top: 0;
}

.eval-loading {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.eval-loading__spinner {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* Evaluations */
.eval-section {
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-4);
}

.eval-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.eval-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.eval-add-btn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  background: none;
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-base);
}

.eval-add-btn:hover { background: rgba(110, 231, 183, 0.1); }

.eval-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.eval-item {
  padding: var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.eval-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-1);
  gap: var(--space-2);
}

.eval-meta-right {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.eval-delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  background: none;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background var(--transition-base), color var(--transition-base), border-color var(--transition-base);
  flex-shrink: 0;
}

.eval-delete-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-critical);
  border-color: rgba(239, 68, 68, 0.25);
}

.eval-inline-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-bg-overlay);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-3);
}

.eval-inline-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}

.btn-primary-sm {
  padding: var(--space-1) var(--space-3);
  background: var(--color-accent);
  border: none;
  border-radius: var(--radius-md);
  color: #0a0c10;
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--transition-base);
}

.btn-primary-sm:hover { opacity: 0.85; }

.btn-secondary-sm {
  padding: var(--space-1) var(--space-3);
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: background var(--transition-base);
}

.btn-secondary-sm:hover { background: var(--color-bg-elevated); }

.eval-evaluator {
  font-size: var(--font-size-xs);
  font-weight: 500;
  color: var(--color-accent);
}

.eval-date {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-primary);
}

.eval-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

.eval-empty {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-style: italic;
  margin: 0;
}

</style>
