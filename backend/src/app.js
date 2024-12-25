import express from 'express';
import { clerkMiddleware } from '@clerk/express';
import dotenv from 'dotenv';
import usersRoute from './routes/users-route.js';

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

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
