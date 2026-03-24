export default function ResultsList({ goodTimes }) {
  if (goodTimes.length === 0) {
    return <p className="text-sm text-gray-500">No available windows in the next 24 hours.</p>
  }

  return (
    <ul className="space-y-1">
      {goodTimes.map(t => (
        <li key={t.weeklySlot} className="text-sm text-gray-800">{t.label}</li>
      ))}
    </ul>
  )
}
