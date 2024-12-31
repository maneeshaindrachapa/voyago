import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/places', async (req, res) => {
  const { location, radius, type } = req.query;
  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
      {
        params: {
          location,
          radius,
          type,
          key: GOOGLE_MAPS_API_KEY,
        },
      },
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data from Google Places API:', error);
    res
      .status(500)
      .json({ error: 'Failed to fetch data from Google Places API' });
  }
});

export default router;
