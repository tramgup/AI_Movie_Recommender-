export default function MovieCard({ movie, isSelected, onSelect, onViewDetails }) {
  return (
    <div
      className={`rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition transform hover:scale-105 cursor-pointer h-full ${
        isSelected ? 'ring-4 ring-red-500' : ''
      }`}
      onClick={() => onSelect(movie)}
    >
      {movie.posterUrl ? (
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-64 object-cover"
        />
      ) : (
        <div className="w-full h-64 bg-slate-300 flex items-center justify-center">
          <span className="text-slate-600">No poster available</span>
        </div>
      )}
      <div className="p-4 bg-slate-800 text-white">
        <h3 className="font-bold text-lg truncate hover:text-red-500">{movie.title}</h3>
        {movie.releaseYear && (
          <p className="text-sm text-slate-400">{movie.releaseYear}</p>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onViewDetails(movie)
          }}
          className="mt-3 w-full bg-slate-700 hover:bg-red-600 text-white py-2 rounded text-sm transition"
        >
          View Details
        </button>
      </div>
    </div>
  )
}
