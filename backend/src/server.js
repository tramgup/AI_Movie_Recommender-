import express from 'express'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/authRoutes.js'
import authMiddleware from './middleware/authMiddleware.js'
import cors from 'cors'

const app = express();
const PORT = process.env.PORT || 5003;

// Get the file path from the URL of the current module
const __filename = fileURLToPath(import.meta.url);
// Get the directory name from the file path
const __dirname = dirname(__filename);

// Middleware
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes, prepends /auth to all authroutes, and /todos to all todoRoutes
app.use('/auth', authRoutes);
app.use('/shopping', authMiddleware, shoppingRoutes);

app.listen(PORT, () => {
    console.log(`Server has started on port: ${PORT}`)
});