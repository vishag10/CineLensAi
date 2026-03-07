const express = require('express');
const router = express.Router();
const MovieHistory = require('../models/MovieHistory');

/**
 * GET /api/history
 * Returns 20 most recent identifications
 */
router.get('/', async (req, res) => {
  try {
    const history = await MovieHistory.find()
      .sort({ timestamp: -1 })
      .limit(20)
      .select('-imageData'); // Exclude image data for performance
    
    res.json({ success: true, history });
  } catch (error) {
    console.error('History GET error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve history' });
  }
});

/**
 * POST /api/history
 * Manually save a result
 */
router.post('/', async (req, res) => {
  try {
    const { title, year, genre, director, description, confidence, method, searchResult } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const history = new MovieHistory({
      title, year, genre, director, description, confidence, method, searchResult
    });

    await history.save();
    res.status(201).json({ success: true, id: history._id });
  } catch (error) {
    console.error('History POST error:', error.message);
    res.status(500).json({ error: 'Failed to save history' });
  }
});

/**
 * DELETE /api/history/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    await MovieHistory.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

module.exports = router;
