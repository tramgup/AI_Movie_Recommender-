# Movie App

Notes on running the project.  
Backend (Express/Prisma), frontend (React/Vite), PostgreSQL with pgvector for embeddings.

```
REACT_APP_API_URL=http://localhost:5003
```
#
```bash
cd backend
npm install
npx prisma migrate deploy      # run migrations
env vars must be set
npm run dev  # or node src/server.js
```

```bash
cd frontend
npm install
npm run dev
```

UI on :3000, api on :5003

### DB / migrations

Prisma handles schema. If you change schema:

```bash
cd backend
npx prisma migrate dev --name whatever
```

To apply already-created migrations:

```bash
npx prisma migrate deploy
npx prisma generate
```

### API

- `/auth`, `/admin` – JWT based (authMiddleware)
- `/home/movies` (GET) – list
- `/home/similar` (POST) – body `{ movieIds:[], limit? }`, needs bearer token

Look at `backend/routes/homeRoutes.js` if unsure.

### Frontend

- `src/pages`: Home, Login, Register, Similarity
- `src/components`: UI
- `src/services/api.js`: axios + auth

`npm run dev` in frontend folder;

### Dev notes

- backend: nodemon/auto-restart
- frontend: Vite watches
- lint via `npm run lint` (frontend)
- prisma studio: `npx prisma studio` in backend

### Scripts

- `tmdbIngest.js` – pull from TMDB
- `nowPlayingIngest.js` – currently playing
- `generateEmbeddings.js` – run embeddings

All live in `backend/src/scripts`; need env + db.