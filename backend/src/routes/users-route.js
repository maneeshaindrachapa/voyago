import express from 'express';
import { clerkClient } from '@clerk/express';

const router = express.Router();

// Get All users
router.get('/users', async (req, res) => {
  const { query } = req.query || '';
  try {
    const response = await clerkClient.users.getUserList();
    const users = response.data;

    const simplifiedUsers = users.map((user) => ({
      id: user.id,
      email: user.emailAddresses?.[0]?.emailAddress || null,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      imageUrl: user.imageUrl || null,
    }));

    res.status(200).json(simplifiedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch users' });
  }
});

export default router;
