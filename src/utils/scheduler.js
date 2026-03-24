const SLOTS_PER_DAY = 48
const SLOTS_PER_WEEK = 336 // 7 * 48

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function getGoodInviteTimes(members, allSlots, timeReservedHours, nowUtc) {
  if (members.length === 0) return []

  const windowSlots = timeReservedHours * 2

  // Build lookup: memberId -> Set of weekly slot numbers
  const memberSlotSets = {}
  for (const member of members) {
    memberSlotSets[member.id] = new Set()
  }
  for (const slot of allSlots) {
    if (memberSlotSets[slot.member_id] !== undefined) {
      memberSlotSets[slot.member_id].add(slot.day_of_week * SLOTS_PER_DAY + slot.slot_index)
    }
  }

  // Current weekly slot: floor to nearest 30-min boundary
  const dayOfWeek = nowUtc.getUTCDay() // 0=Sun ... 6=Sat
  const minuteOfDay = nowUtc.getUTCHours() * 60 + nowUtc.getUTCMinutes()
  const currentSlot = dayOfWeek * SLOTS_PER_DAY + Math.floor(minuteOfDay / 30)
  const currentDay = Math.floor(currentSlot / SLOTS_PER_DAY)

  const goodTimes = []

  for (let i = 0; i < 48; i++) {
    const candidateSlot = (currentSlot + i) % SLOTS_PER_WEEK

    let allCovered = true
    for (const member of members) {
      let memberCovers = false
      const slotSet = memberSlotSets[member.id]
      for (let j = 0; j < windowSlots; j++) {
        if (slotSet.has((candidateSlot + j) % SLOTS_PER_WEEK)) {
          memberCovers = true
          break
        }
      }
      if (!memberCovers) {
        allCovered = false
        break
      }
    }

    if (allCovered) {
      const candidateDay = Math.floor(candidateSlot / SLOTS_PER_DAY)
      const slotIndex = candidateSlot % SLOTS_PER_DAY
      const totalMinutes = slotIndex * 30
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`

      let dayLabel
      if (candidateDay === currentDay) {
        dayLabel = 'Today'
      } else if (candidateDay === (currentDay + 1) % 7) {
        dayLabel = 'Tomorrow'
      } else {
        dayLabel = DAY_NAMES[candidateDay]
      }

      goodTimes.push({
        weeklySlot: candidateSlot,
        label: `${dayLabel} ${timeStr} UTC`,
      })
    }
  }

  return goodTimes
}
