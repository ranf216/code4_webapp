import moment from 'moment'
import type { Moment, MomentInput } from 'moment'

export function utcToLocal(value: MomentInput): Moment {
  return moment.utc(value).local()
}

export function localToUtc(value: MomentInput): Moment {
  return moment(value).utc()
}
