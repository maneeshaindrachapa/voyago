import express from 'express';
import { clerkMiddleware } from '@clerk/express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import usersRoute from './routes/users-route.js';
import locationRoute from './routes/location-route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Add security headers
app.use(morgan('dev')); // Log incoming requests
app.use(express.json()); // Parse incoming JSON requests
app.use(
  cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);
app.use(clerkMiddleware());

// Routes
app.use('/api', usersRoute);
app.use('/locations', locationRoute);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Server is healthy');
});

// Default Route
app.get('/', (req, res) => {
  res.send('Welcome to the Voyago!');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default app;
