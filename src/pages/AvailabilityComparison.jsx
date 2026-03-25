import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { DateTime } from 'luxon'
import { supabase } from '../lib/supabase'
import { detectBrowserTimezone, localSlotToUtcSlot } from '../utils/timezone'
import NavBar from '../components/NavBar'

const SLOTS_PER_DAY = 48
const SLOTS_PER_WEEK = 336

export default function AvailabilityComparison() {
  const { id } = useParams()
  const [members, setMembers] = useState([])
  const [memberSlotSets, setMemberSlotSets] = useState({})
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const viewerTz = detectBrowserTimezone()

  useEffect(() => {
    async function load() {
      const { data: teamData } = await supabase
        .from('teams')
        .select('id')
        .eq('id', id)
        .maybeSingle()

      if (!teamData) { setNotFound(true); setLoading(false); return }

      const { data: membersData } = await supabase
        .from('members')
        .select('*')
        .eq('team_id', id)

      const activeMembers = (membersData || []).filter(m => m.active !== false)
      const memberIds = activeMembers.map(m => m.id)

      let slotsData = []
      if (memberIds.length > 0) {
        const { data } = await supabase
          .from('availability_slots')
          .select('*')
          .in('member_id', memberIds)
        slotsData = data || []
      }

      // Build slot sets keyed by member id (weekly slot numbers)
      const sets = {}
      for (const m of activeMembers) sets[m.id] = new Set()
      for (const s of slotsData) {
        if (sets[s.member_id] !== undefined) {
          sets[s.member_id].add(s.day_of_week * SLOTS_PER_DAY + s.slot_index)
        }
      }

      setMembers(activeMembers)
      setMemberSlotSets(sets)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div>
        <NavBar />
        <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div>
        <NavBar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-gray-700 mb-4">Team not found.</p>
            <Link to="/" className="text-blue-600 hover:underline">Back to home</Link>
          </div>
        </div>
      </div>
    )
  }

  // Build the 24 local hours starting from the current hour
  const now = DateTime.now().setZone(viewerTz).startOf('hour')
  const hours = Array.from({ length: 24 }, (_, i) => now.plus({ hours: i }))

  // For each local datetime, compute the UTC weekly slot number
  function utcWeeklySlot(localDt) {
    const jsDay = localDt.weekday === 7 ? 0 : localDt.weekday
    const slotIndex = localDt.hour * 2 + Math.floor(localDt.minute / 30)
    const { dayOfWeek, slotIndex: utcSlot } = localSlotToUtcSlot(jsDay, slotIndex, viewerTz)
    return dayOfWeek * SLOTS_PER_DAY + utcSlot
  }

  // Check if a member is available during a given local hour.
  // Check both 30-min slots within the hour — necessary for half-hour offset timezones
  // (e.g. Australia/Adelaide UTC+9:30) where members' UTC slots are all odd.
  function isMemberAvailable(memberId, localDt) {
    const s = memberSlotSets[memberId]
    if (!s) return false
    const w0 = utcWeeklySlot(localDt) % SLOTS_PER_WEEK
    const w1 = utcWeeklySlot(localDt.plus({ minutes: 30 })) % SLOTS_PER_WEEK
    return s.has(w0) || s.has(w1)
  }

  return (
    <div>
      <NavBar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-gray-900">Availability Overview</h1>
          <Link to={`/team/${id}`} className="text-sm text-blue-600 hover:underline">← Back to team</Link>
        </div>
        <p className="text-xs text-gray-400 mb-6">Next 24 hours — times in {viewerTz}</p>

        {members.length === 0 ? (
          <p className="text-sm text-gray-500">No active members.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="text-xs border-collapse w-full">
              <thead>
                <tr>
                  <th className="text-left text-gray-500 font-normal pr-4 pb-2 w-28">Time</th>
                  {members.map(m => (
                    <th key={m.id} className="text-center text-gray-700 font-medium pb-2 px-1 min-w-16">
                      {m.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hours.map((localDt, i) => {
                  const isNow = i === 0
                  return (
                    <tr key={i} className={isNow ? 'bg-blue-50' : ''}>
                      <td className={`pr-4 py-1 font-mono ${isNow ? 'font-semibold text-blue-700' : 'text-gray-500'}`}>
                        {isNow ? 'Now  ' : ''}{localDt.toFormat('EEE HH:mm')}
                      </td>
                      {members.map(m => {
                        const available = isMemberAvailable(m.id, localDt)
                        return (
                          <td key={m.id} className="px-1 py-1 text-center">
                            <span className={`inline-block w-8 h-5 rounded-sm ${available ? 'bg-green-400' : 'bg-gray-100'}`} />
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
