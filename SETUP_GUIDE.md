# Quick Setup & Testing Guide

## Prerequisites
- Node.js and npm installed
- Backend server running on `http://localhost:5003`
- Database populated with movies

## 1. Install Dependencies (Already Done)
```bash
cd frontend
npm install react-router-dom
```

## 2. Start Development Server
```bash
cd frontend
npm run dev
```

The app opens at: **http://localhost:5173**

## 3. First Time Testing

### Step 1: Create an Account
- Go to the Register page
- Fill in email, username (must be unique), and password (min 8 chars)
- Click Register
- You'll be redirected to Home page

### Step 2: Browse Movies
- **Home page loads with available movies**
- See movie posters in a responsive grid
- Each card shows title, year, and "View Details" button
- Click any "View Details" button to see full movie information in a modal

### Step 3: Search for Movies
- Use the search bar at the top
- Type a movie title (e.g., "Avatar", "Inception")
- Click Search or press Enter
- Results display in the grid below
- Click Clear to reset and see all movies again

### Step 4: Select Movies
- Click on any movie card to select it
- Selected movies get a **red border** and are shown in a list above the grid
- Select up to 5 movies
- Remove individual selections by clicking the × next to the movie name

### Step 5: Find Similar Movies
- After selecting 1-5 movies, click the **"Find Similar Movies"** button
- You'll be taken to the Similarity page
- Results show movies similar to your selections
- Click on any movie to view its full details
- Click "Back to Home" to make a new selection

### Step 6: Logout
- Click the **Logout** button in the top right
- You'll be redirected to the login page

## 4. Testing Checklist

- [ ] User Registration works
- [ ] User Login works
- [ ] Movies display on home page
- [ ] Movie search returns results
- [ ] Movie details modal shows all information
- [ ] Movie selection (up to 5) works
- [ ] "Find Similar" button redirects to similarity page
- [ ] Similarity search returns results
- [ ] Logout clears authentication
- [ ] Protected routes redirect to login when not authenticated

## 5. Troubleshooting

### Backend Connection Error
- Make sure backend is running on `http://localhost:5003`
- Check backend console for errors
- Verify CORS is enabled in backend

### Movies Not Showing
- Backend needs movies in database
- Run ingestion script if needed:
  ```bash
  cd backend
  npm run ingest  # or your ingest command
  ```

### Search Returns No Results
- Database may not have movies with those titles
- Try searching for common movie names
- Check database connection

### Similarity Search Errors
- Movies need embeddings generated
- Run embedding generation in backend:
  ```bash
  cd backend
  npm run generate-embeddings  # or your command
  ```

## 6. File Structure Summary

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Home.jsx
│   │   └── Similarity.jsx
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── MovieCard.jsx
│   │   └── MovieDetailsModal.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── package.json
├── vite.config.js
└── index.html
```

## 7. Key Features

✅ **Registration & Login** - Secure authentication with JWT
✅ **Movie Discovery** - Browse and search movies
✅ **Movie Details** - Full information display in modal
✅ **Smart Selection** - Select up to 5 movies for comparison
✅ **Similarity Search** - Find similar movies based on selections
✅ **Responsive Design** - Works on mobile, tablet, desktop
✅ **Dark Theme** - Eye-friendly dark mode with red accents
✅ **Protected Routes** - Automatic redirect for unauthenticated users

## 8. API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/register` | User registration |
| POST | `/auth/login` | User login |
| GET | `/home` | Get paginated movies |
| GET | `/home/search?query=...` | Search movies by title |
| POST | `/home/similar` | Find similar movies |

All authenticated endpoints require a valid JWT token in the Authorization header.

## 9. Next Steps (Optional Enhancements)

- Add user ratings/favorites
- Add pagination for search results
- Add filtering by genre
- Add movie recommendations based on history
- Add dark/light theme toggle
- Add user profile page
- Add watchlist feature

Enjoy! 🎬
