const API_BASE_URL = 'http://localhost:5003'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const api = {
  // Auth endpoints
  register: async (email, username, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    })
    return res.json()
  },

  login: async (emailOrUsername, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrUsername, password }),
    })
    return res.json()
  },

  // Movie endpoints
  searchMovies: async (query) => {
    if (!query || query.trim() === '') {
      throw new Error('Search query cannot be empty')
    }
    
    const searchUrl = new URL(`${API_BASE_URL}/home/search`)
    searchUrl.searchParams.append('query', query)
    searchUrl.searchParams.append('limit', '20')
    
    const res = await fetch(searchUrl.toString(), {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    
    if (!res.ok) {
      throw new Error(`Search failed with status ${res.status}`)
    }
    
    return res.json()
  },

  getMovies: async (page = 1, nowPlaying = true) => {
    const res = await fetch(`${API_BASE_URL}/home?page=${page}&nowPlaying=${nowPlaying}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    return res.json()
  },

  // Similarity endpoint
  findSimilarMovies: async (movieIds, limit = 10) => {
    const res = await fetch(`${API_BASE_URL}/home/similar`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ movieIds, limit }),
    })
    return res.json()
  },
}
