import { Link } from 'react-router-dom'
import NavBar from '../components/NavBar'

export default function NotFound() {
  return (
    <div>
      <NavBar />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-700 mb-4">Page not found.</p>
          <Link to="/" className="text-blue-600 hover:underline">Back to home</Link>
        </div>
      </div>
    </div>
  )
}
