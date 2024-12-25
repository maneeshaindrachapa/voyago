import express from 'express';
import { clerkMiddleware } from '@clerk/express';
import dotenv from 'dotenv';
import cors from 'cors';
import usersRoute from './routes/users-route.js';

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS
app.use(
  cors({
    origin: process.env.FRONT_END_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }),
);

// Middleware
app.use(clerkMiddleware());

// Routes
app.use('/api', usersRoute);

// Default Route
app.get('/', (req, res) => {
  res.send('Welcome to the Voyago!');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
