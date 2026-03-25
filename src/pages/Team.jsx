import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getGoodInviteTimes } from '../utils/scheduler'
import { detectBrowserTimezone } from '../utils/timezone'
import ResultsList from '../components/ResultsList'
import TimezoneSelector from '../components/TimezoneSelector'
import NavBar from '../components/NavBar'

function formatTeamId(id) {
  return `${id.slice(0, 4)}-${id.slice(4, 7)}-${id.slice(7)}`
}

const CONFIG_FIELDS = [
  { field: 'time_reserved_hours', label: 'Time reserved for invitees (hours)' },
]

export default function Team() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [team, setTeam] = useState(null)
  const [members, setMembers] = useState([])
  const [slots, setSlots] = useState([])
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  const [viewerTz, setViewerTz] = useState(() => detectBrowserTimezone())
  const [showTzOverride, setShowTzOverride] = useState(false)

  const [editingConfig, setEditingConfig] = useState(false)
  const [configDraft, setConfigDraft] = useState({})
  const [savingConfig, setSavingConfig] = useState(false)

  const load = useCallback(async () => {
    const { data: teamData } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (!teamData) {
      setNotFound(true)
      setLoading(false)
      return
    }

    const { data: membersData } = await supabase
      .from('members')
      .select('*')
      .eq('team_id', id)

    const memberIds = (membersData || []).map(m => m.id)
    let slotsData = []
    if (memberIds.length > 0) {
      const { data } = await supabase
        .from('availability_slots')
        .select('*')
        .in('member_id', memberIds)
      slotsData = data || []
    }

    setTeam(teamData)
    setMembers(membersData || [])
    setSlots(slotsData)
    setLastUpdated(new Date())
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!team) return
    document.title = `Questie Team ${formatTeamId(id)}`
    return () => { document.title = 'Questies Assemble!' }
  }, [team, id])

  async function handleSaveConfig() {
    setSavingConfig(true)
    const update = {}
    for (const { field } of CONFIG_FIELDS) {
      const v = parseInt(configDraft[field], 10)
      if (!isNaN(v)) update[field] = v
    }
    const { data: updated, error } = await supabase
      .from('teams')
      .update(update)
      .eq('id', id)
      .select()
      .single()
    if (!error && updated) {
      setTeam(updated)
      setLastUpdated(new Date())
    }
    setEditingConfig(false)
    setSavingConfig(false)
  }

  async function handleToggleActive(member) {
    await supabase
      .from('members')
      .update({ active: !member.active })
      .eq('id', member.id)
    await load()
  }

  async function handleRemoveMember(member) {
    if (!window.confirm(`Remove ${member.name} from this team?`)) return
    await supabase.from('members').delete().eq('id', member.id)
    await load()
  }

  function handleRefresh() {
    load()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-700 mb-4">Team not found.</p>
          <Link to="/" className="text-blue-600 hover:underline">Back to home</Link>
        </div>
      </div>
    )
  }

  const activeMembers = members.filter(m => m.active !== false)
  const goodTimes = getGoodInviteTimes(activeMembers, slots, team.time_reserved_hours, new Date(), viewerTz)

  return (
    <div>
    <NavBar />
    <div className="max-w-xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">
        {team.name || `Team ${formatTeamId(id)}`}
      </h1>
      <p className="text-sm text-gray-500 mb-1">Team ID: {formatTeamId(id)}</p>
      <p className="text-xs text-gray-400 mb-8">
        Times shown in: <strong>{viewerTz}</strong>
        {' '}
        <button
          onClick={() => setShowTzOverride(v => !v)}
          className="text-blue-500 hover:underline text-xs"
        >
          {showTzOverride ? 'done' : 'change'}
        </button>
      </p>

      {showTzOverride && (
        <div className="mb-6">
          <TimezoneSelector value={viewerTz} onChange={tz => { setViewerTz(tz); setShowTzOverride(false) }} />
        </div>
      )}

      <section className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-800">Quest Configuration</h2>
          {!editingConfig && (
            <button
              onClick={() => {
                setConfigDraft({ ...team })
                setEditingConfig(true)
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              Edit Config
            </button>
          )}
        </div>

        {editingConfig ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-3">
            {CONFIG_FIELDS.map(({ field, label }) => (
              <div key={field} className="flex items-center justify-between gap-4">
                <label className="text-sm text-gray-700">{label}</label>
                <input
                  type="number"
                  min="1"
                  value={configDraft[field] ?? ''}
                  onChange={e => setConfigDraft(prev => ({ ...prev, [field]: e.target.value }))}
                  className="border border-gray-300 rounded px-2 py-1 w-20 text-sm text-gray-900 text-right"
                />
              </div>
            ))}
            <div className="flex gap-2 mt-1">
              <button
                onClick={handleSaveConfig}
                disabled={savingConfig}
                className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {savingConfig ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => setEditingConfig(false)}
                className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded text-sm font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <ul className="text-sm text-gray-600 space-y-1">
            <li>Time reserved for invitees: {team.time_reserved_hours} hours</li>
          </ul>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Members</h2>
        {members.length === 0 ? (
          <p className="text-sm text-gray-500 mb-3">No members yet.</p>
        ) : (
          <ul className="mb-3 space-y-1">
            {members.map(m => (
              <li key={m.id} className="flex items-center gap-3">
                <Link
                  to={`/team/${id}/member/${m.id}`}
                  className={`text-sm hover:underline ${m.active === false ? 'text-gray-400 line-through' : 'text-blue-600'}`}
                >
                  {m.name}
                </Link>
                <span className="text-xs text-gray-900">({m.timezone})</span>
                <button
                  onClick={() => handleToggleActive(m)}
                  className="text-xs px-2 py-0.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
                >
                  {m.active === false ? 'Enable' : 'Disable'}
                </button>
                <button
                  onClick={() => handleRemoveMember(m)}
                  className="text-xs px-2 py-0.5 rounded border border-red-300 text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={() => navigate(`/team/${id}/member/new`)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Add Member
        </button>
      </section>

      <section>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-gray-800">Good Times to Send Invites</h2>
          <Link to={`/team/${id}/grid`} className="text-sm text-blue-600 hover:underline">View availability grid →</Link>
        </div>
        <p className="text-xs text-gray-400 mb-3">Next 24 hours — times in {viewerTz}</p>
        <ResultsList goodTimes={goodTimes} lastUpdated={lastUpdated} onRefresh={handleRefresh} />
      </section>
    </div>
    </div>
  )
}
