import { useState, useMemo } from 'react'

function getAllZones() {
  try {
    return Intl.supportedValuesOf('timeZone')
  } catch {
    return ['UTC']
  }
}

function getFriendlyLabel(tz) {
  try {
    const offset = new Intl.DateTimeFormat('en', {
      timeZone: tz,
      timeZoneName: 'shortOffset',
    })
      .formatToParts(new Date())
      .find(p => p.type === 'timeZoneName')?.value || ''
    return `${tz.replace(/_/g, ' ')} (${offset})`
  } catch {
    return tz
  }
}

const ALL_ZONES = getAllZones()

export default function TimezoneSelector({ value, onChange }) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return ALL_ZONES
    const q = search.toLowerCase()
    return ALL_ZONES.filter(tz => tz.toLowerCase().includes(q))
  }, [search])

  return (
    <div className="max-w-sm">
      <input
        type="text"
        placeholder="Search timezones…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="border border-gray-300 rounded-t-lg px-3 py-2 w-full text-gray-900 text-sm"
      />
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        size={6}
        className="border border-gray-300 border-t-0 rounded-b-lg px-2 py-1 w-full text-gray-900 text-sm block"
      >
        {filtered.map(tz => (
          <option key={tz} value={tz}>
            {getFriendlyLabel(tz)}
          </option>
        ))}
      </select>
    </div>
  )
}
