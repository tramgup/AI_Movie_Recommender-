import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import MovieCard from '../components/MovieCard'
import MovieDetailsModal from '../components/MovieDetailsModal'

export default function Home() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [movies, setMovies] = useState([])
  const [selectedMovies, setSelectedMovies] = useState([])
  const [selectedMovieDetails, setSelectedMovieDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  // Initial load - get first page of movies
  useEffect(() => {
    loadInitialMovies()
  }, [])

  const loadInitialMovies = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await api.getMovies(1)
      setMovies(result.movies || [])
      setHasSearched(false)
    } catch (err) {
      setError('Failed to load movies')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    
    const trimmedQuery = searchQuery.trim()
    if (!trimmedQuery) {
      loadInitialMovies()
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const result = await api.searchMovies(trimmedQuery)
      
      if (result.error) {
        setError(result.error)
        setMovies([])
      } else {
        setMovies(result.movies || [])
        setHasSearched(true)
        
        if (!result.movies || result.movies.length === 0) {
          setError('No movies found matching your search.')
        }
      }
    } catch (err) {
      setError(`Search error: ${err.message}`)
      console.error('Search error:', err)
      setMovies([])
    } finally {
      setLoading(false)
    }
  }

  const handleMovieSelect = (movie) => {
    const isAlreadySelected = selectedMovies.some((m) => m.id === movie.id)
    
    if (isAlreadySelected) {
      setSelectedMovies(selectedMovies.filter((m) => m.id !== movie.id))
    } else {
      if (selectedMovies.length < 5) {
        setSelectedMovies([...selectedMovies, movie])
      } else {
        setError('You can select a maximum of 5 movies')
      }
    }
  }

  const handleFindSimilar = async () => {
    if (selectedMovies.length === 0) {
      setError('Please select at least one movie')
      return
    }

    const movieIds = selectedMovies.map((m) => m.id)
    navigate('/similarity', { state: { selectedMovieIds: movieIds } })
  }

  const isMovieSelected = (movieId) => {
    return selectedMovies.some((m) => m.id === movieId)
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Search Section */}
      <div className="bg-slate-900 py-8 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for movies..."
                className="flex-1 px-4 py-3 bg-slate-800 text-white rounded border border-slate-700 focus:border-red-500 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded transition"
              >
                Search
              </button>
              <button
                type="button"
                onClick={loadInitialMovies}
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded transition"
              >
                Clear
              </button>
            </div>
          </form>

          {/* Selected Movies Info */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-sm">
                {selectedMovies.length > 0 ? (
                  <>
                    <span className="text-red-500 font-bold">{selectedMovies.length}</span>
                    {' '}
                    {selectedMovies.length === 1 ? 'movie' : 'movies'} selected (max 5)
                  </>
                ) : (
                  'Select movies to find similar ones'
                )}
              </p>
              {selectedMovies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedMovies.map((movie) => (
                    <span
                      key={movie.id}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center gap-2"
                    >
                      {movie.title}
                      <button
                        onClick={() => handleMovieSelect(movie)}
                        className="font-bold hover:text-slate-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {selectedMovies.length > 0 && (
              <button
                onClick={handleFindSimilar}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition whitespace-nowrap"
              >
                Find Similar Movies
              </button>
            )}
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

      {/* Movies Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">Loading movies...</p>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">
              {hasSearched ? 'No movies found. Try a different search.' : 'No movies available.'}
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-white text-2xl font-bold mb-6">
              {hasSearched ? `Search Results for "${searchQuery}"` : 'Discover Movies'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  isSelected={isMovieSelected(movie.id)}
                  onSelect={handleMovieSelect}
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
