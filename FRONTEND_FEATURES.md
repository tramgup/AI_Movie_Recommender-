# Movie Finder UI - Feature Overview

A complete React + Tailwind CSS frontend for the MovieFinder application with beautiful dark theme design.

## 📋 Features Implemented

### 1. **Authentication Pages**
- **Login Page** (`/pages/Login.jsx`)
  - Email or username login
  - Password validation
  - Error handling with user feedback
  - Link to registration page
  
- **Register Page** (`/pages/Register.jsx`)
  - Email, username, and password registration
  - Password confirmation validation
  - 8-character minimum password requirement
  - User-friendly error messages
  - Link to login page

### 2. **Home/Discovery Page** (`/pages/Home.jsx`)
- **Movie Search**
  - Real-time search for movies by title
  - Search results displayed in grid layout
  - Clear button to reset search and load all movies
  - Initial page load displays available movies

- **Movie Selection & Display**
  - Click on movie cards to select/deselect (max 5 movies)
  - Selected movies are highlighted with red border
  - Display movie posters with fallback for missing images
  - Movie cards show title and release year
  
- **Movie Details Modal** (`/components/MovieDetailsModal.jsx`)
  - Full movie information display on card click:
    - Title, poster, release year
    - Director information
    - Cast (top 5 actors)
    - Genres
    - Synopsis/description
  - Modal overlay with close button
  
- **Selection Management**
  - Shows count of selected movies (max 5)
  - Display selected movie titles at top
  - Quick remove button for each selected movie
  - "Find Similar Movies" button appears when selections made

### 3. **Similarity Search Page** (`/pages/Similarity.jsx`)
- **Results Display**
  - Shows all similar movies found based on selected movies
  - Grid layout matching home page
  - Click movies to view full details
  - "Back to Home" button for navigation

### 4. **Navigation & Layout**
- **Navbar Component** (`/components/Navbar.jsx`)
  - App branding with movie emoji
  - Navigation links (Discover, Find Similar)
  - User greeting showing username
  - Logout button
  - Dark theme with red accent color
  
- **Protected Routes**
  - Login/register pages only accessible when not authenticated
  - Home/similarity pages require authentication
  - Automatic redirect to login for unauthenticated users
  - Token-based authentication with localStorage

### 5. **Movie Card Component** (`/components/MovieCard.jsx`)
- Movie poster image display
- Title and release year
- Fallback for missing posters
- "View Details" button for full information
- Visual selection indicator
- Hover effects with scale transform

## 🎨 Design Features

- **Color Scheme**
  - Dark theme (slate-900/slate-950) for comfort
  - Red accent color (#DC2626) for primary actions
  - High contrast for accessibility
  
- **Responsive Layout**
  - Mobile-first design
  - 1 column on mobile
  - 2 columns on tablets
  - 4 columns on desktop
  - Fully responsive navigation

- **User Experience**
  - Loading states with feedback
  - Error messages with context
  - Success feedback on actions
  - Smooth transitions and hover effects
  - Sticky search bar while browsing

## 🔌 API Integration

### Backend Endpoints Used:
```javascript
// Authentication
POST /auth/register        // Register new user
POST /auth/login          // Login user

// Movie Discovery
GET /home                 // Get paginated movies
GET /home/search          // Search movies by title
POST /home/similar        // Find similar movies
```

### API Service (`/services/api.js`)
- Centralized API calls
- Automatic token injection in headers
- Error handling
- Base URL configuration (http://localhost:5003)

## 📁 File Structure

```
src/
├── pages/
│   ├── Login.jsx          # Login authentication
│   ├── Register.jsx       # User registration
│   ├── Home.jsx          # Movie discovery & search
│   └── Similarity.jsx     # Similar movies results
├── components/
│   ├── Navbar.jsx        # Navigation bar
│   ├── MovieCard.jsx     # Movie display card
│   └── MovieDetailsModal.jsx  # Full movie details
├── services/
│   └── api.js            # API communication
├── App.jsx               # Main routing component
├── App.css               # Global styles
├── index.css             # Tailwind imports
└── main.jsx              # React entry point
```

## 🚀 How to Use

### Starting the Application

1. **Backend** (if not running):
```bash
cd backend
npm run dev  # or your backend start command
```

2. **Frontend**:
```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173/`

### User Flow

1. **Register/Login**
   - Create account or login with existing credentials
   - Token stored in localStorage

2. **Discover Movies**
   - Browse movies on home page
   - Search for movies by title
   - Click on movies to view full details

3. **Select & Compare**
   - Click movie cards to select (up to 5)
   - Selected movies shown at top
   - Click "Find Similar Movies" button

4. **View Results**
   - Browse similar movies in results page
   - Click to view full details
   - Return to home to make new selection

## ⚙️ Configuration

### Backend API Base URL
Configured in `/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:5003'
```

Change this if your backend runs on a different port.

### Authentication Token
- Stored in `localStorage` as `token`
- User data stored as `user` (JSON)
- Automatically sent with authenticated requests

## 🔒 Authentication

- JWT tokens issued by backend
- 24-hour token expiration
- Stored client-side for persistence
- Automatic cleanup on logout

## 🎯 Features in Detail

### Movie Search
- Case-insensitive title matching
- Returns up to 20 results
- Real-time feedback

### Movie Selection
- Maximum 5 movies can be selected
- Visual feedback for selected items
- Easy selection/deselection
- Display of selected movie names

### Similarity Search
- Pass selected movie IDs to backend
- Returns 20 most similar movies
- Based on embedding vectors
- Full details viewable for each result

## 🛠️ Technologies Used

- **React 19** - UI framework
- **React Router DOM** - Client-side routing
- **Tailwind CSS 4** - Styling
- **Vite** - Build tool and dev server

## 📝 Notes

- Backend must be running at `http://localhost:5003`
- Search requires backend to have movies in database
- Similarity search requires movies with embeddings
- Images (posters) displayed from TMDB URLs
