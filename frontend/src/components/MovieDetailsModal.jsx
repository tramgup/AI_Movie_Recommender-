import { getGenreName } from '../constants/genres'

export default function MovieDetailsModal({ movie, onClose }) {
  if (!movie) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="flex gap-6 p-6">
          {/* Poster */}
          <div className="flex-shrink-0">
            {movie.posterUrl ? (
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-40 h-60 object-cover rounded"
              />
            ) : (
              <div className="w-40 h-60 bg-slate-700 rounded flex items-center justify-center">
                <span className="text-slate-400 text-center text-sm">No poster</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 text-white">
            <h2 className="text-3xl font-bold mb-2">{movie.title}</h2>

            {movie.releaseYear && (
              <p className="text-slate-400 mb-3">Released: {movie.releaseYear}</p>
            )}

            {movie.director && (
              <div className="mb-4">
                <p className="text-slate-400">Director</p>
                <p className="text-lg">{movie.director}</p>
              </div>
            )}

            {movie.cast && movie.cast.length > 0 && (
              <div className="mb-4">
                <p className="text-slate-400">Cast</p>
                <p className="text-sm">{movie.cast.join(', ')}</p>
              </div>
            )}

            {movie.genre && movie.genre.length > 0 && (
              <div className="mb-4">
                <p className="text-slate-400">Genres</p>
                <div className="flex flex-wrap gap-2">
                  {movie.genre.map((g) => (
                    <span key={g} className="bg-red-600 px-3 py-1 rounded text-sm">
                      {getGenreName(g)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {movie.description && (
              <div className="mb-4">
                <p className="text-slate-400">Synopsis</p>
                <p className="text-sm text-slate-300">{movie.description}</p>
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-red-500 text-2xl"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}
