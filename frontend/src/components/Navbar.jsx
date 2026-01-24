import { Link } from 'react-router-dom'

export default function Navbar({ user, onLogout }) {
  return (
    <nav className="bg-slate-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/home" className="text-2xl font-bold text-red-500">
              🎬 MovieFinder
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link to="/home" className="hover:text-red-500 transition">
                Discover
              </Link>
              <Link to="/similarity" className="hover:text-red-500 transition">
                Find Similar
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">Welcome, {user?.username}</span>
            <button
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
