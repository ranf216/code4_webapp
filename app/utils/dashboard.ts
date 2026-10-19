import { utcToLocal } from './dateTime'

// Visual encoding maps for the Dashboard module
// See: screen_design/Dashboard & Analytics Module — UI Updates Required.md §2.3–2.5

export const CALL_CATEGORY_COLORS: Record<string, string> = {
  medical_emergency: '#DC3545',
  security_emergency: '#FD7E14',
  concierge_service: '#0D6EFD',
  panic: '#842029',
  test: '#6C757D',
}

export const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#DC3545',
  important: '#FD7E14',
  normal: '#0D6EFD',
  low: '#6C757D',
}

export const PRIORITY_ICONS: Record<string, string> = {
  urgent: 'lucide:circle-alert',
  important: 'lucide:arrow-up',
  normal: 'lucide:minus',
  low: 'lucide:arrow-down',
}

export const PRIORITY_SORT: Record<string, number> = {
  urgent: 1,
  important: 2,
  normal: 3,
  low: 4,
}

export function priorityIcon(priority: string): string {
  return PRIORITY_ICONS[priority] ?? 'lucide:minus'
}

export function prioritySortWeight(priority: string): number {
  return PRIORITY_SORT[priority] ?? 99
}

export const TASK_STATUS_COLORS: Record<string, string> = {
  new: '#0D6EFD',
  accepted: '#0DCAF0',
  approved: '#6610F2',
  completed: '#198754',
  rejected: '#DC3545',
  canceled: '#6C757D',
}

export const TASK_STATUS_ORDER = ['new', 'accepted', 'approved', 'completed', 'rejected', 'canceled']

export function taskStatusSortWeight(status: string): number {
  const idx = TASK_STATUS_ORDER.indexOf(status)
  return idx === -1 ? 99 : idx
}

export const REPORT_STATUS_COLORS: Record<string, string> = {
  draft: '#E9ECEF',
  submitted: '#0D6EFD',
  under_review: '#FD7E14',
  changes_requested: '#E6A817',
  approved: '#198754',
  delivered: '#0DCAF0',
}

// Pipeline order (§3.3.2) and statuses whose light background needs dark text (§2.5)
export const REPORT_STATUS_ORDER = ['draft', 'submitted', 'under_review', 'changes_requested', 'approved', 'delivered']
const REPORT_STATUS_DARK_TEXT = new Set(['draft', 'changes_requested'])

export function reportStatusSortWeight(status: string): number {
  const idx = REPORT_STATUS_ORDER.indexOf(status)
  return idx === -1 ? 99 : idx
}

export function reportStatusTextColor(status: string): string {
  return REPORT_STATUS_DARK_TEXT.has(status) ? '#212529' : '#FFFFFF'
}

export const CALL_STATUS_COLORS: Record<string, string> = {
  new: '#0D6EFD',
  accepted: '#0DCAF0',
  resolved: '#198754',
  canceled: '#6C757D',
}

export function colorFor(map: Record<string, string>, key: string, fallback = '#6C757D'): string {
  return map[key] ?? fallback
}

const CALL_CATEGORY_LABELS: Record<string, string> = {
  medical_emergency: 'Medical',
  security_emergency: 'Security',
  concierge_service: 'Concierge',
  panic: 'Panic',
  test: 'Test',
}

export function callCategoryLabel(category: string): string {
  return CALL_CATEGORY_LABELS[category] ?? humanizeKey(category)
}

export function relativeTime(utcDateStr: string | null | undefined): string {
  if (!utcDateStr) return ''
  return utcToLocal(utcDateStr).fromNow()
}

export function fullDateTime(utcDateStr: string | null | undefined): string {
  if (!utcDateStr) return ''
  return utcToLocal(utcDateStr).format('YYYY-MM-DD HH:mm')
}

export function secondsAgo(date: Date | null): number {
  if (!date) return 0
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000))
}

export function humanizeKey(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function truncate(text: string, max: number): string {
  if (!text) return ''
  return text.length > max ? `${text.slice(0, max)}…` : text
}
