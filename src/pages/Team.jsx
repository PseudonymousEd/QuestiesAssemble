import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getGoodInviteTimes } from '../utils/scheduler'
import ResultsList from '../components/ResultsList'

export default function Team() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [team, setTeam] = useState(null)
  const [members, setMembers] = useState([])
  const [slots, setSlots] = useState([])
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
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
      setLoading(false)
    }
    load()
  }, [id])

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

  const goodTimes = getGoodInviteTimes(members, slots, team.time_reserved_hours, new Date())

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Questies Assemble!</h1>
      <p className="text-sm text-gray-500 mb-8">Team ID: {id}</p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Quest Configuration</h2>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>Min participants: {team.min_participants}</li>
          <li>Max participants: {team.max_participants}</li>
          <li>Max invites: {team.max_invites}</li>
          <li>Time reserved for invitees: {team.time_reserved_hours} hours</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Members</h2>
        {members.length === 0 ? (
          <p className="text-sm text-gray-500 mb-3">No members yet.</p>
        ) : (
          <ul className="mb-3 space-y-1">
            {members.map(m => (
              <li key={m.id}>
                <Link
                  to={`/team/${id}/member/${m.id}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  {m.name}
                </Link>
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
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Good Times to Send Invites</h2>
        <p className="text-xs text-gray-400 mb-3">Next 24 hours — times in UTC</p>
        <ResultsList goodTimes={goodTimes} />
      </section>
    </div>
  )
}
