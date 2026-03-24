import { DateTime } from 'luxon'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function detectBrowserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

// luxon weekday: 1=Mon ... 7=Sun → JS convention: 0=Sun ... 6=Sat
function toJsDay(luxonWeekday) {
  return luxonWeekday === 7 ? 0 : luxonWeekday
}

// Get the DateTime for this week's Sunday 00:00 in the given timezone
function getRefSunday(tzName) {
  const now = DateTime.now().setZone(tzName)
  const jsDay = toJsDay(now.weekday)
  return now.startOf('day').minus({ days: jsDay })
}

// Convert local (day_of_week, slot_index) → UTC (day_of_week, slot_index)
export function localSlotToUtcSlot(dayOfWeek, slotIndex, tzName) {
  const localDt = getRefSunday(tzName).plus({ days: dayOfWeek, minutes: slotIndex * 30 })
  const utcDt = localDt.toUTC()
  return {
    dayOfWeek: toJsDay(utcDt.weekday),
    slotIndex: utcDt.hour * 2 + Math.floor(utcDt.minute / 30),
  }
}

// Convert UTC (day_of_week, slot_index) → local (day_of_week, slot_index)
export function utcSlotToLocalSlot(dayOfWeek, slotIndex, tzName) {
  const utcNow = DateTime.now().toUTC()
  const refUtcSunday = utcNow.startOf('day').minus({ days: toJsDay(utcNow.weekday) })
  const utcDt = refUtcSunday.plus({ days: dayOfWeek, minutes: slotIndex * 30 })
  const localDt = utcDt.setZone(tzName)
  return {
    dayOfWeek: toJsDay(localDt.weekday),
    slotIndex: localDt.hour * 2 + Math.floor(localDt.minute / 30),
  }
}

// Convert UTC (day_of_week, slot_index) → a human-readable local time label string
// nowUtc: JS Date (the same reference used by the scheduler)
export function utcSlotToLocalLabel(dayOfWeek, slotIndex, tzName, nowUtc) {
  const utcNow = DateTime.fromJSDate(nowUtc).toUTC()
  const refUtcSunday = utcNow.startOf('day').minus({ days: toJsDay(utcNow.weekday) })
  let utcDt = refUtcSunday.plus({ days: dayOfWeek, minutes: slotIndex * 30 })

  // If the computed time is in the past, it wraps to next week (scheduler uses % 336)
  if (utcDt.toMillis() < utcNow.toMillis()) {
    utcDt = utcDt.plus({ weeks: 1 })
  }

  const localDt = utcDt.setZone(tzName)
  const localNow = DateTime.fromJSDate(nowUtc).setZone(tzName)
  const localCandidateJsDay = toJsDay(localDt.weekday)
  const localNowJsDay = toJsDay(localNow.weekday)

  let dayLabel
  if (localCandidateJsDay === localNowJsDay) {
    dayLabel = 'Today'
  } else if (localCandidateJsDay === (localNowJsDay + 1) % 7) {
    dayLabel = 'Tomorrow'
  } else {
    dayLabel = DAY_NAMES[localCandidateJsDay]
  }

  const timeStr = localDt.toFormat('HH:mm')
  const abbr = localDt.offsetNameShort

  return `${dayLabel} ${timeStr} ${abbr}`
}
