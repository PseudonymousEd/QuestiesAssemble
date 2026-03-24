import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

async function generateUniqueTeamId() {
  while (true) {
    const id = String(Math.floor(Math.random() * 9000000000) + 1000000000)
    const { data } = await supabase
      .from('teams')
      .select('id')
      .eq('id', id)
      .maybeSingle()
    if (!data) return id
  }
}

const DEFAULT_CONFIG = {
  min_participants: 3,
  max_participants: 8,
  max_invites: 7,
  time_reserved_hours: 5,
  required_action_minutes: 1,
}

export default function Home() {
  const [teamId, setTeamId] = useState('')
  const [teamName, setTeamName] = useState('')
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [showConfig, setShowConfig] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function setConfigField(field, value) {
    const num = parseInt(value, 10)
    setConfig(prev => ({ ...prev, [field]: isNaN(num) ? '' : num }))
  }

  async function handleCreateTeam() {
    setError('')
    const id = await generateUniqueTeamId()
    const { error: insertError } = await supabase.from('teams').insert({
      id,
      name: teamName.trim() || null,
      min_participants: config.min_participants || DEFAULT_CONFIG.min_participants,
      max_participants: config.max_participants || DEFAULT_CONFIG.max_participants,
      max_invites: config.max_invites || DEFAULT_CONFIG.max_invites,
      time_reserved_hours: config.time_reserved_hours || DEFAULT_CONFIG.time_reserved_hours,
      required_action_minutes: config.required_action_minutes || DEFAULT_CONFIG.required_action_minutes,
    })
    if (insertError) {
      setError('Failed to create team. Please try again.')
      return
    }
    navigate(`/team/${id}`)
  }

  async function handleGoToTeam(e) {
    e.preventDefault()
    const trimmed = teamId.trim().replace(/-/g, '')
    if (!/^\d{10}$/.test(trimmed)) {
      setError('Team ID must be a 10-digit number.')
      return
    }
    navigate(`/team/${trimmed}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center max-w-xl px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Questies Assemble!</h1>
        <p className="text-lg text-gray-600 mb-6">
          Enter your team's weekly availability so everyone gets a fair chance
          to accept quest invites before the window closes.
        </p>

        <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 mb-6 text-sm text-amber-800">
          <strong>⚠ This site is currently IN TEST.</strong> Teams and member data may disappear at any time without notice.
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 text-left">
            <label className="text-sm font-medium text-gray-700">Team Name (optional)</label>
            <input
              type="text"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              placeholder="e.g. The Night Owls"
              className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900 text-sm"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowConfig(v => !v)}
            className="text-sm text-blue-600 hover:underline text-left"
          >
            {showConfig ? 'Hide quest config ▲' : 'Customize quest config ▼'}
          </button>

          {showConfig && (
            <div className="text-left bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-3">
              {[
                { field: 'min_participants', label: 'Min participants' },
                { field: 'max_participants', label: 'Max participants' },
                { field: 'max_invites', label: 'Max invites' },
                { field: 'time_reserved_hours', label: 'Time reserved for invitees (hours)' },
              ].map(({ field, label }) => (
                <div key={field} className="flex items-center justify-between gap-4">
                  <label className="text-sm text-gray-700">{label}</label>
                  <input
                    type="number"
                    min="1"
                    value={config[field]}
                    onChange={e => setConfigField(field, e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 w-20 text-sm text-gray-900 text-right"
                  />
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleCreateTeam}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
          >
            Create a Team
          </button>

          <div className="text-gray-400 text-sm">or join an existing team</div>

          <form onSubmit={handleGoToTeam} className="flex gap-2">
            <input
              type="text"
              value={teamId}
              onChange={e => { setTeamId(e.target.value); setError('') }}
              placeholder="Enter Team ID (e.g. 4827-163-095)"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
            />
            <button
              type="submit"
              className="bg-gray-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900"
            >
              Go
            </button>
          </form>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>

        <p className="text-xs text-gray-400 mt-8">Developed by PseudonymousEd</p>
      </div>
    </div>
  )
}
