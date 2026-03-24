import NavBar from '../components/NavBar'

const FEATURES = [
  {
    title: 'Select unavailable times',
    description:
      'Mark the times you are busy instead of available — the app will treat everything else as free.',
  },
  {
    title: "See everyone's availability",
    description:
      'View a combined grid showing when all team members are free at a glance.',
  },
  {
    title: 'Select times as a block',
    description:
      'Click and drag (or click a start and end cell) to select a range of time slots at once, rather than toggling cells one by one.',
  },
  {
    title: 'Security and logins',
    description:
      'Team access will be protected by accounts and logins, preventing random people from modifying your team\'s schedule.',
  },
  {
    title: 'Enable and disable team members',
    description:
      'Temporarily exclude a member from scheduling calculations without removing them from the team — useful when someone is on a break or unavailable for a period.',
  },
]

export default function ComingFeatures() {
  return (
    <div>
      <NavBar />
      <div className="max-w-xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Planned Features</h1>
        <p className="text-sm text-gray-500 mb-8">Here's what's planned for future updates.</p>
        <ul className="space-y-6">
          {FEATURES.map(f => (
            <li key={f.title} className="border border-gray-200 rounded-lg px-5 py-4">
              <h2 className="text-base font-semibold text-gray-800 mb-1">{f.title}</h2>
              <p className="text-sm text-gray-600">{f.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
