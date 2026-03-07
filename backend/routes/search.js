const express = require('express');
const router = express.Router();
const { searchMovie } = require('../services/searchService');

/**
 * POST /api/search
 * Body: { query: string }
 */
router.post('/', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = await searchMovie(query);
    res.json(results);

  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
