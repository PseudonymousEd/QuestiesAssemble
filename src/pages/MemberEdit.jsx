import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AvailabilityGrid from '../components/AvailabilityGrid'

export default function MemberEdit() {
  const { id: teamId, memberId } = useParams()
  const navigate = useNavigate()
  const isNew = !memberId

  const [name, setName] = useState('')
  const [timezone, setTimezone] = useState('UTC')
  const [selectedSlots, setSelectedSlots] = useState(new Set())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isNew) return
    async function load() {
      const { data: member } = await supabase
        .from('members')
        .select('*')
        .eq('id', memberId)
        .maybeSingle()
      if (member) {
        setName(member.name)
        setTimezone(member.timezone)
      }
    }
    load()
  }, [memberId, isNew])

  async function handleSave() {
    if (!name.trim()) {
      setError('Name is required.')
      return
    }
    setSaving(true)
    setError('')

    let currentMemberId = memberId

    if (isNew) {
      const { data, error: insertError } = await supabase
        .from('members')
        .insert({ team_id: teamId, name: name.trim(), timezone })
        .select('id')
        .single()
      if (insertError) {
        setError('Failed to save member.')
        setSaving(false)
        return
      }
      currentMemberId = data.id
    } else {
      const { error: updateError } = await supabase
        .from('members')
        .update({ name: name.trim(), timezone, updated_at: new Date().toISOString() })
        .eq('id', memberId)
      if (updateError) {
        setError('Failed to save member.')
        setSaving(false)
        return
      }
    }

    // Replace all slots for this member
    await supabase.from('availability_slots').delete().eq('member_id', currentMemberId)

    if (selectedSlots.size > 0) {
      const rows = Array.from(selectedSlots).map(key => {
        const [day, slot] = key.split('-').map(Number)
        return { member_id: currentMemberId, day_of_week: day, slot_index: slot }
      })
      const { error: slotsError } = await supabase.from('availability_slots').insert(rows)
      if (slotsError) {
        setError('Failed to save availability.')
        setSaving(false)
        return
      }
    }

    navigate(`/team/${teamId}`)
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isNew ? 'Add Member' : 'Edit Member'}
      </h1>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 w-full max-w-sm text-gray-900"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Timezone (IANA, e.g. America/New_York)
        </label>
        <input
          type="text"
          value={timezone}
          onChange={e => setTimezone(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 w-full max-w-sm text-gray-900"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Availability (UTC) — click to toggle 1-hour blocks
        </label>
        <AvailabilityGrid selectedSlots={selectedSlots} onChange={setSelectedSlots} />
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={() => navigate(`/team/${teamId}`)}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
