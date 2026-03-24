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

export default function Home() {
  const [teamId, setTeamId] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleCreateTeam() {
    setError('')
    const id = await generateUniqueTeamId()
    const { error: insertError } = await supabase.from('teams').insert({
      id,
      min_participants: 3,
      max_participants: 8,
      max_invites: 7,
      time_reserved_hours: 5,
      required_action_minutes: 1,
    })
    if (insertError) {
      setError('Failed to create team. Please try again.')
      return
    }
    navigate(`/team/${id}`)
  }

  async function handleGoToTeam(e) {
    e.preventDefault()
    const trimmed = teamId.trim()
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
        <p className="text-lg text-gray-600 mb-8">
          Enter your team's weekly availability so everyone gets a fair chance
          to accept quest invites before the window closes.
        </p>
        <div className="flex flex-col gap-4">
          <button
            onClick={handleCreateTeam}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
          >
            Create a Team
          </button>
          <div className="text-gray-400 text-sm">or</div>
          <form onSubmit={handleGoToTeam} className="flex gap-2">
            <input
              type="text"
              value={teamId}
              onChange={e => { setTeamId(e.target.value); setError('') }}
              placeholder="Enter 10-digit Team ID"
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
      </div>
    </div>
  )
}
