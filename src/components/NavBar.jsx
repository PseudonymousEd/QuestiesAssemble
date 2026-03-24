import { Link } from 'react-router-dom'

export default function NavBar() {
  return (
    <nav className="w-full bg-gray-50 border-b border-gray-200 px-6 py-2">
      <Link to="/" className="text-sm font-semibold text-blue-600 hover:underline">
        ← Questies Assemble!
      </Link>
    </nav>
  )
}
