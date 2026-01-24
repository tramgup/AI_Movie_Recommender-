import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../services/api'

export default function Login({ onLogin }) {
  const navigate = useNavigate()
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await api.login(emailOrUsername, password)

      if (result.error) {
        setError(result.error || result.message || 'Login failed')
      } else if (result.token) {
        onLogin(result.token, result.user)
        navigate('/home')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-lg shadow-xl p-8">
          <h1 className="text-4xl font-bold text-white mb-2 text-center">🎬</h1>
          <h2 className="text-3xl font-bold text-white text-center mb-6">MovieFinder</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-600 text-white p-3 rounded text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Email or Username
              </label>
              <input
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-red-500 focus:outline-none"
                placeholder="Enter your email or username"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-red-500 focus:outline-none"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white font-bold py-2 px-4 rounded transition"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-slate-400 text-center mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-red-500 hover:text-red-400 font-medium">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
