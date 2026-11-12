import moment from 'moment'
import type { Moment, MomentInput } from 'moment'

export function utcToLocal(value: MomentInput): Moment {
  return moment.utc(value).local()
}

export function localToUtc(value: MomentInput): Moment {
  return moment(value).utc()
}

export function formatUtcAsLocal(
  value: MomentInput | null | undefined,
  fmt = 'YYYY-MM-DD HH:mm',
): string {
  if (!value) return '—'
  const m = utcToLocal(value)
  return m.isValid() ? m.format(fmt) : '—'
}

export function localToApiUtc(value: MomentInput): string {
  return localToUtc(value).format('YYYY-MM-DD HH:mm:ss')
}

export function todayLocalDate(): string {
  return moment().format('YYYY-MM-DD')
}

export function utcToLocalInputValue(value: MomentInput | null | undefined): string {
  if (!value) return ''
  const m = utcToLocal(value)
  return m.isValid() ? m.format('YYYY-MM-DDTHH:mm') : ''
}

export function localDateOnly(value: string | null | undefined): Moment {
  return moment(value ?? '', 'YYYY-MM-DD', true)
}
