const express = require('express');
const router = express.Router();
const { analyzeImage } = require('../services/huggingfaceService');
const { searchMovie, buildSearchQuery } = require('../services/searchService');
const MovieHistory = require('../models/MovieHistory');

/**
 * POST /api/identify
 * Body: { image: string (base64), useSearch: boolean }
 */
router.post('/', async (req, res) => {
  try {
    const { image, useSearch = true } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Strip base64 prefix if present (data:image/jpeg;base64,...)
    const base64Clean = image.replace(/^data:image\/[a-z]+;base64,/, '');

    console.log('🔍 Analyzing image with HuggingFace LLaVA...');
    const aiResult = await analyzeImage(base64Clean);

    let searchResult = null;
    let finalTitle = aiResult.title;
    let finalConfidence = aiResult.confidence;
    let method = 'Model Only';

    if (useSearch) {
      console.log('🌐 Step 2: Verifying with DuckDuckGo...');
      const query = aiResult.title !== 'Unknown' ? buildSearchQuery(aiResult) : `${aiResult.description} movie`;
      searchResult = await searchMovie(query);

      if (searchResult.success) {
        method = 'Model + Search';
        // If search confirms the title, boost confidence
        if (
          searchResult.topResult.title.toLowerCase().includes(aiResult.title.toLowerCase()) ||
          searchResult.topResult.snippet?.toLowerCase().includes(aiResult.title.toLowerCase())
        ) {
          finalConfidence = 'High';
        }
      }
    }

    const result = {
      ...aiResult,
      title: finalTitle,
      confidence: finalConfidence,
      method,
      searchResult: searchResult?.topResult || null
    };

    // Save to MongoDB (non-blocking)
    try {
      const history = new MovieHistory({
        title: result.title,
        year: result.year,
        genre: result.genre,
        director: result.director,
        description: result.description,
        confidence: result.confidence,
        method: result.method,
        imageData: base64Clean.substring(0, 500), // Store thumbnail preview only
        searchResult: result.searchResult
      });
      await history.save();
      console.log('💾 Saved to MongoDB history');
    } catch (dbError) {
      console.warn('⚠️  Could not save to MongoDB:', dbError.message);
    }

    console.log(`✅ Result: "${result.title}" (${result.year}) — ${result.confidence} confidence`);
    res.json({ success: true, result });

  } catch (error) {
    console.error('Identify error:', error.message);
    const status = error.response?.status === 429 || error.message.includes('rate limit') ? 429 : 500;
    res.status(status).json({
      error: error.message || 'Identification failed',
      hint: status === 429 ? 'HuggingFace rate limited. Wait a moment and retry, or upgrade your HF plan.' : undefined
    });
  }
});

module.exports = router;
