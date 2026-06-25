<script setup lang="ts">
const { t } = useTranslation()

// Audit entry type
interface AuditEntry {
  id: string
  timestamp: string
  user: string
  action: 'edit' | 'approve' | 'request_changes' | 'deliver' | 'submit' | 'note'
  details: string
  field?: string
  oldValue?: string
  newValue?: string
}

interface ReportSection {
  id: string
  title: string
  clientVisible: boolean
  content: string
}

// Report status types
interface IncidentReport {
  id: string
  title: string
  template: string
  community: string
  officer: string
  submittedAt: string
  status: 'submitted' | 'under_review' | 'changes_requested' | 'approved' | 'delivered'
  sourceCall?: string
  reviewRequired: boolean
  category: 'incident' | 'daily_activity' | 'custom'
  content: string
  originalContent: string
  managerNotes: string
  sections: ReportSection[]
  auditTrail: AuditEntry[]
}

// Mock data
const reports = ref<IncidentReport[]>([
  {
    id: 'RPT-2024-001',
    title: 'Suspicious Activity at Main Gate',
    template: 'Security Incident Report',
    community: 'Willow Creek',
    officer: 'John Smith',
    submittedAt: '2024-06-15T14:30:00',
    status: 'submitted',
    sourceCall: 'CALL-884',
    reviewRequired: true,
    category: 'incident',
    content: 'Officer observed suspicious individual near the main gate. Individual was questioned and identified as a resident\'s guest. No further action required.',
    originalContent: 'Officer observed suspicious individual near the main gate. Individual was questioned and identified as a resident\'s guest. No further action required.',
    managerNotes: '',
    sections: [
      { id: 'sec1', title: 'Incident Summary', clientVisible: true, content: 'Suspicious activity at main gate' },
      { id: 'sec2', title: 'Officer Actions', clientVisible: true, content: 'Questioned individual, verified identity' },
      { id: 'sec3', title: 'Resolution', clientVisible: false, content: 'Individual cleared, no threat identified' },
    ],
    auditTrail: [
      { id: '1', timestamp: '2024-06-15T14:30:00', user: 'John Smith', action: 'submit', details: 'Report submitted' },
    ],
  },
  {
    id: 'RPT-2024-002',
    title: 'Daily Patrol Summary',
    template: 'Daily Activity Report',
    community: 'Oakwood Estates',
    officer: 'Sarah Johnson',
    submittedAt: '2024-06-15T18:00:00',
    status: 'under_review',
    reviewRequired: false,
    category: 'daily_activity',
    content: 'Completed routine patrol of all sectors. All gates secure. No incidents reported. Assisted 2 residents with access issues.',
    originalContent: 'Completed routine patrol of all sectors. All gates secure. No incidents reported. Assisted 2 residents with access issues.',
    managerNotes: '',
    sections: [
      { id: 'sec1', title: 'Patrol Summary', clientVisible: true, content: 'Routine patrol completed' },
    ],
    auditTrail: [
      { id: '1', timestamp: '2024-06-15T18:00:00', user: 'Sarah Johnson', action: 'submit', details: 'Report submitted' },
      { id: '2', timestamp: '2024-06-16T09:00:00', user: 'Manager', action: 'edit', details: 'Report opened for review', field: 'status', oldValue: 'submitted', newValue: 'under_review' },
    ],
  },
  {
    id: 'RPT-2024-003',
    title: 'Vehicle Break-in Attempt',
    template: 'Security Incident Report',
    community: 'Pine Valley',
    officer: 'Mike Davis',
    submittedAt: '2024-06-14T09:15:00',
    status: 'changes_requested',
    sourceCall: 'CALL-875',
    reviewRequired: true,
    category: 'incident',
    content: 'Attempted break-in reported in parking lot B. Vehicle was damaged but nothing stolen. Police notified and report filed.',
    originalContent: 'Attempted break-in reported in parking lot B. Vehicle was damaged but nothing stolen. Police notified and report filed.',
    managerNotes: 'Please add photos of vehicle damage and police report number.',
    sections: [
      { id: 'sec1', title: 'Incident Details', clientVisible: true, content: 'Break-in attempt parking lot B' },
      { id: 'sec2', title: 'Vehicle Damage', clientVisible: true, content: 'Damage documented' },
    ],
    auditTrail: [
      { id: '1', timestamp: '2024-06-14T09:15:00', user: 'Mike Davis', action: 'submit', details: 'Report submitted' },
      { id: '2', timestamp: '2024-06-14T10:30:00', user: 'Manager', action: 'request_changes', details: 'Please add photos of vehicle damage and police report number.' },
    ],
  },
  {
    id: 'RPT-2024-004',
    title: 'Noise Complaint Resolution',
    template: 'Custom Report',
    community: 'Willow Creek',
    officer: 'Emily Wilson',
    submittedAt: '2024-06-14T16:45:00',
    status: 'approved',
    sourceCall: 'CALL-871',
    reviewRequired: true,
    category: 'custom',
    content: 'Noise complaint from resident in Building C Unit 12. Spoke with residents who agreed to keep volume down after 10pm.',
    originalContent: 'Noise complaint from resident in Building C Unit 12. Spoke with residents who agreed to keep volume down after 10pm.',
    managerNotes: '',
    sections: [
      { id: 'sec1', title: 'Complaint Details', clientVisible: true, content: 'Noise complaint Building C Unit 12' },
      { id: 'sec2', title: 'Resolution', clientVisible: true, content: 'Agreement reached with residents' },
    ],
    auditTrail: [
      { id: '1', timestamp: '2024-06-14T16:45:00', user: 'Emily Wilson', action: 'submit', details: 'Report submitted' },
      { id: '2', timestamp: '2024-06-15T10:00:00', user: 'Manager', action: 'approve', details: 'Report approved' },
    ],
  },
  {
    id: 'RPT-2024-005',
    title: 'Emergency Drill Documentation',
    template: 'Daily Activity Report',
    community: 'Oakwood Estates',
    officer: 'John Smith',
    submittedAt: '2024-06-13T11:00:00',
    status: 'delivered',
    reviewRequired: false,
    category: 'daily_activity',
    content: 'Emergency evacuation drill completed successfully. All residents participated. Response time improved by 15% from last quarter.',
    originalContent: 'Emergency evacuation drill completed successfully. All residents participated. Response time improved by 15% from last quarter.',
    managerNotes: '',
    sections: [
      { id: 'sec1', title: 'Drill Summary', clientVisible: true, content: 'Evacuation drill completed' },
      { id: 'sec2', title: 'Performance Metrics', clientVisible: true, content: '15% improvement in response time' },
    ],
    auditTrail: [
      { id: '1', timestamp: '2024-06-13T11:00:00', user: 'John Smith', action: 'submit', details: 'Report submitted' },
      { id: '2', timestamp: '2024-06-14T09:00:00', user: 'Manager', action: 'approve', details: 'Report approved' },
      { id: '3', timestamp: '2024-06-14T14:00:00', user: 'Manager', action: 'deliver', details: 'Report delivered to client' },
    ],
  },
])

// Filters
const selectedCommunity = ref<string>('')
const selectedStatus = ref<string>('')
const selectedCategory = ref<string>('')
const searchQuery = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const reviewRequired = ref<string>('')

const communities = ['Willow Creek', 'Oakwood Estates', 'Pine Valley']
const statuses = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'changes_requested', label: 'Changes Requested' },
  { value: 'approved', label: 'Approved' },
  { value: 'delivered', label: 'Delivered' },
]
const categories = [
  { value: 'incident', label: 'Incident' },
  { value: 'daily_activity', label: 'Daily Activity' },
  { value: 'custom', label: 'Custom' },
]

// Filtered reports
const filteredReports = computed(() => {
  return reports.value.filter((report: IncidentReport) => {
    if (selectedCommunity.value && report.community !== selectedCommunity.value) {
      return false
    }
    if (selectedStatus.value && report.status !== selectedStatus.value) {
      return false
    }
    if (selectedCategory.value && report.category !== selectedCategory.value) {
      return false
    }
    if (reviewRequired.value !== '') {
      const required = reviewRequired.value === 'yes'
      if (report.reviewRequired !== required) {
        return false
      }
    }
    if (dateFrom.value && new Date(report.submittedAt) < new Date(dateFrom.value)) {
      return false
    }
    if (dateTo.value && new Date(report.submittedAt) > new Date(dateTo.value + 'T23:59:59')) {
      return false
    }
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      return (
        report.id.toLowerCase().includes(query) ||
        report.title.toLowerCase().includes(query) ||
        report.officer.toLowerCase().includes(query)
      )
    }
    return true
  })
})

function clearFilters() {
  selectedCommunity.value = ''
  selectedStatus.value = ''
  selectedCategory.value = ''
  searchQuery.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  reviewRequired.value = ''
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const selectedReport = ref<IncidentReport | null>(null)
const showReportModal = ref(false)
const isEditing = ref(false)
const editedContent = ref('')
const editedManagerNotes = ref('')
const showApprovalPanel = ref(false)
const managementSummary = ref('')
const originalStatusBeforeReview = ref<string>('')
const hasActionBeenTaken = ref(false)
const showAuditTrail = ref(false)
const changeRequestComments = ref('')
const showChangeRequestModal = ref(false)

function openReportDetails(report: typeof reports.value[0]) {
  // Create a deep copy to avoid reference issues
  selectedReport.value = JSON.parse(JSON.stringify(report))
  editedContent.value = report.content
  editedManagerNotes.value = report.managerNotes
  managementSummary.value = ''
  showApprovalPanel.value = false
  isEditing.value = false
  showAuditTrail.value = false
  hasActionBeenTaken.value = false
  changeRequestComments.value = ''
  showChangeRequestModal.value = false

  // If report is submitted, change to under_review and save original status
  if (report.status === 'submitted') {
    originalStatusBeforeReview.value = 'submitted'
    report.status = 'under_review'
    // Also update selectedReport status so UI shows correctly
    selectedReport.value!.status = 'under_review'
    // Add audit entry
    const auditEntry: AuditEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      user: 'Manager',
      action: 'edit',
      details: 'Report opened for review',
      field: 'status',
      oldValue: 'submitted',
      newValue: 'under_review',
    }
    report.auditTrail.push(auditEntry)
    // Also add to selectedReport audit trail
    selectedReport.value!.auditTrail.push({ ...auditEntry })
  }

  showReportModal.value = true
}

function closeReportModal() {
  // If no action taken and original was submitted, revert to submitted
  if (!hasActionBeenTaken.value && originalStatusBeforeReview.value === 'submitted' && selectedReport.value) {
    const originalReport = reports.value.find((r: IncidentReport) => r.id === selectedReport.value!.id)
    if (originalReport && originalReport.status === 'under_review') {
      originalReport.status = 'submitted'
      const auditEntry: AuditEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        user: 'Manager',
        action: 'edit',
        details: 'Review closed without action - status reverted',
        field: 'status',
        oldValue: 'under_review',
        newValue: 'submitted',
      }
      originalReport.auditTrail.push(auditEntry)
    }
  }

  showReportModal.value = false
  showApprovalPanel.value = false
  isEditing.value = false
  showAuditTrail.value = false
  showChangeRequestModal.value = false
  // Delay clearing selectedReport to prevent UI flicker
  setTimeout(() => {
    selectedReport.value = null
  }, 300)
}

function toggleEditMode() {
  if (isEditing.value) {
    // Save changes
    if (selectedReport.value) {
      const originalReport = reports.value.find((r: IncidentReport) => r.id === selectedReport.value!.id)
      if (originalReport) {
        // Track content changes
        if (originalReport.content !== editedContent.value) {
          const auditEntry: AuditEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            user: 'Manager',
            action: 'edit',
            details: 'Content updated by manager',
            field: 'content',
            oldValue: originalReport.content,
            newValue: editedContent.value,
          }
          originalReport.auditTrail.push(auditEntry)
          originalReport.content = editedContent.value
        }
        // Track notes changes
        if (originalReport.managerNotes !== editedManagerNotes.value) {
          const auditEntry: AuditEntry = {
            id: (Date.now() + 1).toString(),
            timestamp: new Date().toISOString(),
            user: 'Manager',
            action: 'note',
            details: 'Manager notes added/updated',
            field: 'managerNotes',
            oldValue: originalReport.managerNotes,
            newValue: editedManagerNotes.value,
          }
          originalReport.auditTrail.push(auditEntry)
          originalReport.managerNotes = editedManagerNotes.value
        }
      }
    }
  }
  isEditing.value = !isEditing.value
}

function toggleSectionVisibility(sectionId: string) {
  if (selectedReport.value) {
    const section = selectedReport.value.sections.find((s: ReportSection) => s.id === sectionId)
    if (section) {
      section.clientVisible = !section.clientVisible
    }
  }
}

function handleApprove() {
  if (!selectedReport.value) return

  if (!showApprovalPanel.value) {
    // Show approval panel for configuration
    showApprovalPanel.value = true
    return
  }

  // Finalize approval
  const originalReport = reports.value.find((r: IncidentReport) => r.id === selectedReport.value!.id)
  if (originalReport) {
    originalReport.status = 'approved'
    originalReport.sections = selectedReport.value.sections

    // Add audit entry
    const auditEntry: AuditEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      user: 'Manager',
      action: 'approve',
      details: managementSummary.value ? `Approved with summary: ${managementSummary.value}` : 'Report approved',
    }
    originalReport.auditTrail.push(auditEntry)

    hasActionBeenTaken.value = true
  }
  closeReportModal()
}

function handleRequestChanges() {
  if (!selectedReport.value) return

  if (!showChangeRequestModal.value) {
    showChangeRequestModal.value = true
    return
  }

  if (!changeRequestComments.value.trim()) {
    alert(t('reports.comments_required'))
    return
  }

  const originalReport = reports.value.find((r: IncidentReport) => r.id === selectedReport.value!.id)
  if (originalReport) {
    originalReport.status = 'changes_requested'

    // Add audit entry
    const auditEntry: AuditEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      user: 'Manager',
      action: 'request_changes',
      details: changeRequestComments.value,
    }
    originalReport.auditTrail.push(auditEntry)

    hasActionBeenTaken.value = true
  }
  showChangeRequestModal.value = false
  closeReportModal()
}

function handleDeliver() {
  if (!selectedReport.value) return

  const originalReport = reports.value.find((r: IncidentReport) => r.id === selectedReport.value!.id)
  if (originalReport) {
    originalReport.status = 'delivered'

    // Add audit entry
    const auditEntry: AuditEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      user: 'Manager',
      action: 'deliver',
      details: 'Report delivered to client',
    }
    originalReport.auditTrail.push(auditEntry)

    hasActionBeenTaken.value = true
  }
  closeReportModal()
}
</script>

<template>
  <div class="incident-reports">
    <!-- Filters -->
    <div class="filters-bar">
      <div class="filter-group search-group">
        <label class="filter-label">{{ t('calls.filters.search') }}</label>
        <div class="search-input-wrapper">
          <Icon name="lucide:search" :size="16" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            :placeholder="t('reports.filters.search_placeholder')"
          />
        </div>
      </div>

      <div class="filter-group">
        <label class="filter-label">{{ t('reports.filters.community') }}</label>
        <select v-model="selectedCommunity" class="filter-select">
          <option value="">{{ t('calls.filters.all') }}</option>
          <option v-for="community in communities" :key="community" :value="community">
            {{ community }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">{{ t('reports.filters.status') }}</label>
        <select v-model="selectedStatus" class="filter-select">
          <option value="">{{ t('calls.filters.all') }}</option>
          <option v-for="status in statuses" :key="status.value" :value="status.value">
            {{ status.label }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">{{ t('reports.filters.category') }}</label>
        <select v-model="selectedCategory" class="filter-select">
          <option value="">{{ t('calls.filters.all') }}</option>
          <option v-for="cat in categories" :key="cat.value" :value="cat.value">
            {{ cat.label }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">{{ t('reports.filters.review_required') }}</label>
        <select v-model="reviewRequired" class="filter-select">
          <option value="">{{ t('calls.filters.all') }}</option>
          <option value="yes">{{ t('common.yes') }}</option>
          <option value="no">{{ t('common.no') }}</option>
        </select>
      </div>

      <div class="filter-group date-range">
        <label class="filter-label">{{ t('reports.filters.date_range') }}</label>
        <div class="date-inputs">
          <input v-model="dateFrom" type="date" class="filter-input" />
          <span class="date-separator">-</span>
          <input v-model="dateTo" type="date" class="filter-input" />
        </div>
      </div>

      <button class="clear-btn" @click="clearFilters">
        <Icon name="lucide:x" :size="14" />
        {{ t('calls.filters.clear') }}
      </button>
    </div>

    <!-- Table -->
    <div class="table-container">
      <table class="reports-table">
        <thead>
          <tr>
            <th>{{ t('reports.report_id') }}</th>
            <th>{{ t('reports.report_title') }}</th>
            <th>{{ t('reports.template') }}</th>
            <th>{{ t('reports.community') }}</th>
            <th>{{ t('reports.officer') }}</th>
            <th>{{ t('reports.submitted_at') }}</th>
            <th>{{ t('reports.status') }}</th>
            <th>{{ t('reports.source_call') }}</th>
            <th>{{ t('reports.review_required') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="report in filteredReports"
            :key="report.id"
            class="report-row clickable"
            @click="openReportDetails(report)"
          >
            <td class="report-id">{{ report.id }}</td>
            <td class="report-title">{{ report.title }}</td>
            <td>{{ report.template }}</td>
            <td>{{ report.community }}</td>
            <td>{{ report.officer }}</td>
            <td>{{ formatDateTime(report.submittedAt) }}</td>
            <td>
              <Badge type="report" :value="report.status" />
            </td>
            <td>
              <span v-if="report.sourceCall" class="source-call">{{ report.sourceCall }}</span>
              <span v-else class="no-call">-</span>
            </td>
            <td>
              <Badge type="review" :value="report.reviewRequired" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-if="filteredReports.length === 0" class="empty-state">
      <Icon name="lucide:file-text" :size="48" class="empty-icon" />
      <p class="empty-text">{{ t('reports.no_reports') }}</p>
    </div>

    <!-- Report Details Modal -->
    <AppModal
      :show="showReportModal"
      :title="t('reports.report_details')"
      cancel-text=""
      :ok-text="t('common.close')"
      @close="closeReportModal"
      @ok="closeReportModal"
    >
      <div v-if="selectedReport" class="report-details">
        <!-- Header -->
        <div class="detail-header">
          <div class="detail-header-main">
            <h3 class="detail-title">{{ selectedReport.title }}</h3>
            <div class="detail-meta">
              <Badge type="report" :value="selectedReport.status" />
              <Badge type="review" :value="selectedReport.reviewRequired" />
              <span class="detail-id">{{ selectedReport.id }}</span>
            </div>
          </div>
          <button
            v-if="selectedReport.status === 'under_review'"
            class="edit-toggle-btn"
            @click="toggleEditMode"
          >
            <Icon :name="isEditing ? 'lucide:save' : 'lucide:edit'" :size="16" />
            {{ isEditing ? t('reports.save_changes') : t('reports.edit_report') }}
          </button>
        </div>

        <!-- Report Info -->
        <div class="detail-info">
          <div class="info-row">
            <span class="info-label">{{ t('reports.officer') }}:</span>
            <span class="info-value">{{ selectedReport.officer }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('reports.community') }}:</span>
            <span class="info-value">{{ selectedReport.community }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('reports.submitted_at') }}:</span>
            <span class="info-value">{{ formatDateTime(selectedReport.submittedAt) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('reports.template') }}:</span>
            <span class="info-value">{{ selectedReport.template }}</span>
          </div>
        </div>

        <!-- Report Content (View Mode) -->
        <div v-if="!isEditing && !showApprovalPanel" class="detail-content">
          <h4 class="section-title">{{ t('reports.report_content') }}</h4>
          <div class="content-box">
            <p>{{ selectedReport.content }}</p>
          </div>

          <!-- Manager Notes -->
          <div v-if="selectedReport.managerNotes" class="manager-notes">
            <h5 class="notes-title">{{ t('reports.manager_notes') }}</h5>
            <p class="notes-content">{{ selectedReport.managerNotes }}</p>
          </div>

          <!-- Report Sections -->
          <div class="report-sections">
            <h5 class="section-subtitle">{{ t('reports.sections') }}</h5>
            <div
              v-for="section in selectedReport.sections"
              :key="section.id"
              class="section-item"
            >
              <div class="section-item-header">
                <span class="section-item-title">{{ section.title }}</span>
                <Badge
                  type="active"
                  :value="section.clientVisible"
                  :class="section.clientVisible ? 'badge--active-yes' : 'badge--active-no'"
                />
              </div>
              <p class="section-item-content">{{ section.content }}</p>
            </div>
          </div>
        </div>

        <!-- Edit Mode -->
        <div v-if="isEditing" class="edit-mode">
          <h4 class="section-title">{{ t('reports.edit_content') }}</h4>
          <textarea
            v-model="editedContent"
            class="edit-textarea"
            rows="6"
            :placeholder="t('reports.content_placeholder')"
          />

          <h4 class="section-title">{{ t('reports.manager_notes') }}</h4>
          <textarea
            v-model="editedManagerNotes"
            class="edit-textarea"
            rows="3"
            :placeholder="t('reports.notes_placeholder')"
          />

          <!-- Audit Trail Toggle -->
          <div class="audit-trail-toggle">
            <button class="toggle-btn" @click="showAuditTrail = !showAuditTrail">
              <Icon :name="showAuditTrail ? 'lucide:chevron-up' : 'lucide:chevron-down'" :size="16" />
              {{ showAuditTrail ? t('reports.hide_audit_trail') : t('reports.show_audit_trail') }}
            </button>
          </div>

          <!-- Audit Trail -->
          <div v-if="showAuditTrail" class="audit-trail">
            <h5 class="section-subtitle">{{ t('reports.audit_trail') }}</h5>
            <div
              v-for="entry in selectedReport.auditTrail"
              :key="entry.id"
              class="audit-entry"
            >
              <div class="audit-entry-header">
                <span class="audit-time">{{ formatDateTime(entry.timestamp) }}</span>
                <span class="audit-user">{{ entry.user }}</span>
                <Badge type="report" :value="entry.action" />
              </div>
              <p class="audit-details">{{ entry.details }}</p>
              <div v-if="entry.field" class="audit-field-change">
                <span class="field-name">{{ entry.field }}:</span>
                <span class="old-value">{{ entry.oldValue }}</span>
                <Icon name="lucide:arrow-right" :size="14" />
                <span class="new-value">{{ entry.newValue }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Approval Panel -->
        <div v-if="showApprovalPanel" class="approval-panel">
          <h4 class="section-title">{{ t('reports.section_delivery_panel') }}</h4>

          <!-- Section Inclusion Checklist -->
          <div class="section-checklist">
            <h5 class="section-subtitle">{{ t('reports.section_inclusion') }}</h5>
            <div
              v-for="section in selectedReport.sections"
              :key="section.id"
              class="section-check-item"
            >
              <label class="check-label">
                <input
                  v-model="section.clientVisible"
                  type="checkbox"
                  class="check-input"
                />
                <span class="check-text">{{ section.title }}</span>
              </label>
            </div>
          </div>

          <!-- Management Summary -->
          <div class="management-summary">
            <h5 class="section-subtitle">{{ t('reports.management_summary') }}</h5>
            <textarea
              v-model="managementSummary"
              class="edit-textarea"
              rows="3"
              maxlength="1000"
              :placeholder="t('reports.summary_placeholder')"
            />
            <span class="char-count">{{ managementSummary.length }}/1000</span>
          </div>
        </div>

        <!-- Change Request Modal (Inline) -->
        <div v-if="showChangeRequestModal" class="change-request-panel">
          <h4 class="section-title">{{ t('reports.request_changes') }}</h4>
          <p class="panel-description">{{ t('reports.changes_description') }}</p>
          <textarea
            v-model="changeRequestComments"
            class="edit-textarea"
            rows="4"
            maxlength="1000"
            :placeholder="t('reports.comments_placeholder')"
          />
          <span class="char-count">{{ changeRequestComments.length }}/1000</span>
        </div>

        <!-- Actions -->
        <div v-if="!showChangeRequestModal" class="detail-actions">
          <button
            v-if="!showApprovalPanel && selectedReport.status === 'under_review'"
            class="action-btn approve-btn"
            @click="handleApprove"
          >
            <Icon name="lucide:check" :size="16" />
            {{ t('reports.approve') }}
          </button>
          <button
            v-if="showApprovalPanel"
            class="action-btn approve-btn"
            @click="handleApprove"
          >
            <Icon name="lucide:check" :size="16" />
            {{ t('reports.finalize_approval') }}
          </button>
          <button
            v-if="!showApprovalPanel && selectedReport.status === 'under_review'"
            class="action-btn changes-btn"
            @click="handleRequestChanges"
          >
            <Icon name="lucide:edit-3" :size="16" />
            {{ t('reports.request_changes') }}
          </button>
          <button
            v-if="selectedReport.status === 'approved'"
            class="action-btn deliver-btn"
            @click="handleDeliver"
          >
            <Icon name="lucide:send" :size="16" />
            {{ t('reports.deliver') }}
          </button>
          <button
            v-if="showApprovalPanel"
            class="action-btn cancel-btn"
            @click="showApprovalPanel = false"
          >
            <Icon name="lucide:x" :size="16" />
            {{ t('common.cancel') }}
          </button>
        </div>

        <!-- Change Request Actions -->
        <div v-else class="detail-actions">
          <button
            class="action-btn changes-btn"
            @click="handleRequestChanges"
          >
            <Icon name="lucide:send" :size="16" />
            {{ t('reports.send_request') }}
          </button>
          <button
            class="action-btn cancel-btn"
            @click="showChangeRequestModal = false"
          >
            <Icon name="lucide:x" :size="16" />
            {{ t('common.cancel') }}
          </button>
        </div>

        <!-- Simple History (when not in edit mode) -->
        <div v-if="!isEditing && !showAuditTrail" class="detail-history">
          <h4 class="section-title">{{ t('reports.history') }}</h4>
          <div class="history-list">
            <div
              v-for="entry in selectedReport.auditTrail.slice(-3)"
              :key="entry.id"
              class="history-item"
            >
              <span class="history-time">{{ formatDateTime(entry.timestamp) }}</span>
              <Badge type="report" :value="entry.action" />
              <span class="history-action">{{ entry.details }}</span>
            </div>
          </div>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<style scoped>
.incident-reports {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Filters */
.filters-bar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  align-items: flex-end;
  padding: var(--space-4);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.filter-label {
  font-size: var(--font-size-xs);
  font-weight: 500;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-select,
.filter-input {
  padding: var(--space-2) var(--space-3);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  min-width: 140px;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.filter-select[multiple] {
  min-height: 80px;
}

.date-range {
  min-width: 280px;
}

.date-inputs {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.date-separator {
  color: var(--color-text-secondary);
}

.search-group {
  flex: 1;
  min-width: 200px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--space-3);
  color: var(--color-text-secondary);
}

.search-input {
  width: 100%;
  padding: var(--space-2) var(--space-3) var(--space-2) var(--space-8);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  color: var(--color-text-primary);
  border-color: var(--color-text-secondary);
}

/* Table */
.table-container {
  overflow-x: auto;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.table-container::-webkit-scrollbar {
  display: none;
}

.reports-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.reports-table th {
  text-align: left;
  padding: var(--space-3) var(--space-4);
  font-weight: 600;
  color: var(--color-text-primary);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.reports-table td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.report-row:hover {
  background: var(--color-surface-hover, rgba(255, 255, 255, 0.03));
}

.report-row.clickable {
  cursor: pointer;
}

.report-id {
  font-family: var(--font-mono);
  font-size: var(--font-size-xs);
  color: var(--color-accent);
}

.report-title {
  font-weight: 500;
  color: var(--color-text-primary);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.source-call {
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: var(--font-size-xs);
}

.no-call,
.no-badge {
  color: var(--color-text-disabled);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12);
  color: var(--color-text-secondary);
}

.empty-icon {
  margin-bottom: var(--space-4);
  opacity: 0.5;
}

.empty-text {
  font-size: var(--font-size-base);
}

/* Report Details Modal */
.report-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.detail-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.detail-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin: 0;
  color: var(--color-text-primary);
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.detail-id {
  font-family: var(--font-mono);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.section-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.content-placeholder {
  padding: var(--space-6);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  text-align: center;
  color: var(--color-text-secondary);
}

.detail-actions {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.approve-btn {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.approve-btn:hover {
  background: rgba(34, 197, 94, 0.25);
}

.changes-btn {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.changes-btn:hover {
  background: rgba(239, 68, 68, 0.25);
}

.deliver-btn {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
}

.deliver-btn:hover {
  background: rgba(59, 130, 246, 0.25);
}

.detail-history {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.history-item {
  display: flex;
  gap: var(--space-3);
  font-size: var(--font-size-sm);
}

.history-time {
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  font-size: var(--font-size-xs);
}

.history-action {
  color: var(--color-text-primary);
}

/* Detail Header with Edit Button */
.detail-header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.edit-toggle-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-toggle-btn:hover {
  background: var(--color-surface-hover, rgba(255, 255, 255, 0.03));
  color: var(--color-text-primary);
}

/* Detail Info */
.detail-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.info-row {
  display: flex;
  gap: var(--space-2);
}

.info-label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.info-value {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

/* Detail Content */
.detail-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.content-box {
  padding: var(--space-4);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  line-height: 1.6;
}

.manager-notes {
  padding: var(--space-3);
  background: rgba(245, 158, 11, 0.1);
  border-radius: var(--radius-md);
  border-left: 3px solid #f59e0b;
}

.notes-title {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: #f59e0b;
  margin: 0 0 var(--space-2) 0;
  text-transform: uppercase;
}

.notes-content {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  margin: 0;
}

/* Report Sections */
.report-sections {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.section-subtitle {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-secondary);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-item {
  padding: var(--space-3);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.section-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.section-item-title {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.section-item-content {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
}

/* Edit Mode */
.edit-mode {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.edit-textarea {
  width: 100%;
  padding: var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  resize: vertical;
  font-family: inherit;
}

.edit-textarea:focus {
  outline: none;
  border-color: var(--color-accent);
}

/* Audit Trail */
.audit-trail-toggle {
  display: flex;
  justify-content: flex-start;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.audit-trail {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  max-height: 300px;
  overflow-y: auto;
}

.audit-entry {
  padding: var(--space-3);
  background: var(--color-background);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--color-accent);
}

.audit-entry-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
  flex-wrap: wrap;
}

.audit-time {
  font-family: var(--font-mono);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.audit-user {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.audit-details {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: 0 0 var(--space-2) 0;
}

.audit-field-change {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-xs);
  font-family: var(--font-mono);
  flex-wrap: wrap;
}

.field-name {
  color: var(--color-text-secondary);
}

.old-value {
  color: #f87171;
  text-decoration: line-through;
}

.new-value {
  color: #4ade80;
}

/* Approval Panel */
.approval-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.section-checklist {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.section-check-item {
  display: flex;
  align-items: center;
}

.check-label {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
}

.check-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-accent);
}

.check-text {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.management-summary {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.char-count {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-align: right;
}

/* Change Request Panel */
.change-request-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
  background: rgba(239, 68, 68, 0.05);
  border-radius: var(--radius-md);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.panel-description {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
}

/* Cancel Button */
.cancel-btn {
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.cancel-btn:hover {
  background: var(--color-surface-hover, rgba(255, 255, 255, 0.03));
  color: var(--color-text-primary);
}

/* History List */
.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

/* Modal Styling - 80% height with scrollable content */
:global(.modal) {
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

:global(.modal__body) {
  max-height: calc(80vh - 120px);
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

:global(.modal__body::-webkit-scrollbar) {
  display: none;
}
</style>
