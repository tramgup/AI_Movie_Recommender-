import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import MovieCard from '../components/MovieCard'
import MovieDetailsModal from '../components/MovieDetailsModal'

export default function Similarity() {
  const location = useLocation()
  const navigate = useNavigate()
  const selectedMovieIds = location.state?.selectedMovieIds || []

  const [selectedMovies, setSelectedMovies] = useState([])
  const [similarMovies, setSimilarMovies] = useState([])
  const [selectedMovieDetails, setSelectedMovieDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (selectedMovieIds.length === 0) {
      navigate('/home')
      return
    }

    loadSimilarMovies()
  }, [selectedMovieIds, navigate])

  const loadSimilarMovies = async () => {
    setLoading(true)
    setError('')

    try {
      const result = await api.findSimilarMovies(selectedMovieIds, 10)

      if (result.error) {
        setError(result.error)
      } else {
        setSimilarMovies(result.similarMovies || [])
        // Fetch the selected movies details from home
        // For now, we'll just show IDs
      }
    } catch (err) {
      setError('Failed to find similar movies')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleClearSelection = () => {
    navigate('/home')
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header Section */}
      <div className="bg-slate-900 py-8 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Similar Movies</h1>
              <p className="text-slate-400">
                Based on {selectedMovieIds.length} selected {selectedMovieIds.length === 1 ? 'movie' : 'movies'}
              </p>
            </div>
            <button
              onClick={handleClearSelection}
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-600 text-white p-4 rounded">
            {error}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">Finding similar movies...</p>
          </div>
        ) : similarMovies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No similar movies found.</p>
          </div>
        ) : (
          <>
            <h2 className="text-white text-2xl font-bold mb-6">
              {similarMovies.length} Similar {similarMovies.length === 1 ? 'Movie' : 'Movies'} Found
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  isSelected={false}
                  onSelect={() => {}}
                  onViewDetails={setSelectedMovieDetails}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Movie Details Modal */}
      <MovieDetailsModal
        movie={selectedMovieDetails}
        onClose={() => setSelectedMovieDetails(null)}
      />
    </div>
  )
}
