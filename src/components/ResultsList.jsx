export default function ResultsList({ goodTimes, lastUpdated, onRefresh }) {
  const updatedStr = lastUpdated
    ? new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(lastUpdated)
    : null

  return (
    <div>
      {goodTimes.length === 0 ? (
        <p className="text-sm text-gray-500">No available windows in the next 24 hours.</p>
      ) : (
        <ul className="space-y-1">
          {goodTimes.map(t => (
            <li key={t.weeklySlot} className="text-sm text-gray-800">{t.label}</li>
          ))}
        </ul>
      )}
      <div className="flex items-center gap-4 mt-3">
        {updatedStr && (
          <span className="text-xs text-gray-400">Last updated: {updatedStr}</span>
        )}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-xs text-blue-600 hover:underline"
          >
            Refresh
          </button>
        )}
      </div>
    </div>
  )
}
