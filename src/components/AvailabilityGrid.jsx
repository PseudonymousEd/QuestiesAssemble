import { useState } from 'react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

function hourLabel(hour) {
  return `${String(hour).padStart(2, '0')}:00`
}

// Each row represents 1 hour; slot_index = hour * 2 (even values only)
export default function AvailabilityGrid({ selectedSlots, onChange, timezone = 'UTC' }) {
  const [markMode, setMarkMode] = useState('available')
  const [unavailableSlots, setUnavailableSlots] = useState(new Set())

  function toggle(day, hour) {
    const key = `${day}-${hour * 2}`

    if (markMode === 'available') {
      const nextAvailable = new Set(selectedSlots)
      if (nextAvailable.has(key)) {
        nextAvailable.delete(key)
      } else {
        nextAvailable.add(key)
        // Clear red if present
        if (unavailableSlots.has(key)) {
          const next = new Set(unavailableSlots)
          next.delete(key)
          setUnavailableSlots(next)
        }
      }
      onChange(nextAvailable)
    } else {
      const nextUnavailable = new Set(unavailableSlots)
      if (nextUnavailable.has(key)) {
        nextUnavailable.delete(key)
      } else {
        nextUnavailable.add(key)
        // Clear blue if present
        if (selectedSlots.has(key)) {
          const next = new Set(selectedSlots)
          next.delete(key)
          onChange(next)
        }
      }
      setUnavailableSlots(nextUnavailable)
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setMarkMode('available')}
          className={`px-3 py-1 rounded text-sm font-medium border ${
            markMode === 'available'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Mark Available
        </button>
        <button
          type="button"
          disabled
          className="px-3 py-1 rounded text-sm font-medium border bg-white text-gray-300 border-gray-200 cursor-not-allowed"
        >
          Mark Unavailable
        </button>
        <span className="text-xs text-gray-400 self-center">(coming soon)</span>
      </div>

      <div className="overflow-x-auto">
        <table className="text-xs border-collapse">
          <thead>
            <tr>
              <th className="w-12 text-gray-500 font-normal pr-2 text-right">
                {timezone === 'UTC' ? 'UTC' : 'Local'}
              </th>
              {DAYS.map(d => (
                <th key={d} className="w-10 text-center text-gray-700 font-medium pb-1">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map(hour => (
              <tr key={hour}>
                <td className="pr-2 text-right text-gray-400 select-none">
                  {hourLabel(hour)}
                </td>
                {DAYS.map((_, day) => {
                  const key = `${day}-${hour * 2}`
                  const isAvailable = selectedSlots.has(key)
                  const isUnavailable = unavailableSlots.has(key)
                  return (
                    <td key={day} className="p-0.5">
                      <button
                        type="button"
                        onClick={() => toggle(day, hour)}
                        className={`w-9 h-5 rounded-sm border ${
                          isAvailable
                            ? 'bg-blue-500 border-blue-600'
                            : isUnavailable
                            ? 'bg-red-400 border-red-500'
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
    </div>
  )
}
