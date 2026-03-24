const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

export default function AvailabilityGrid({ selectedSlots, onChange }) {
  function toggle(day, hour) {
    const key = `${day}-${hour * 2}` // hour * 2 converts to even slot_index
    const next = new Set(selectedSlots)
    if (next.has(key)) {
      next.delete(key)
    } else {
      next.add(key)
    }
    onChange(next)
  }

  return (
    <div className="overflow-x-auto">
      <table className="text-xs border-collapse">
        <thead>
          <tr>
            <th className="w-12 text-gray-500 font-normal pr-2 text-right">UTC</th>
            {DAYS.map(d => (
              <th key={d} className="w-10 text-center text-gray-700 font-medium pb-1">{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HOURS.map(hour => (
            <tr key={hour}>
              <td className="pr-2 text-right text-gray-400 select-none">
                {String(hour).padStart(2, '0')}:00
              </td>
              {DAYS.map((_, day) => {
                const key = `${day}-${hour * 2}`
                const selected = selectedSlots.has(key)
                return (
                  <td key={day} className="p-0.5">
                    <button
                      type="button"
                      onClick={() => toggle(day, hour)}
                      className={`w-9 h-5 rounded-sm border ${
                        selected
                          ? 'bg-blue-500 border-blue-600'
                          : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
                      }`}
                    />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
