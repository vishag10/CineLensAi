const express = require('express');
const router = express.Router();
const { captionImage } = require('../services/huggingfaceService');
const { searchMovieByCaption } = require('../services/tmdbService');

/**
 * POST /api/detect-movie
 *
 * Body (JSON):
 *   { "image": "<base64 string>" }   — with or without data URI prefix
 *
 * Response (JSON):
 *   {
 *     success: true,
 *     caption: "a man in a suit...",   // raw BLIP output
 *     movie: { title, year, overview, posterUrl, tmdbUrl } | null
 *   }
 */
router.post('/', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, error: 'image (base64) is required in request body' });
    }

    // Strip data URI prefix if present: "data:image/jpeg;base64,..."
    const base64Clean = image.replace(/^data:image\/[a-z]+;base64,/, '');

    // Step 1: Generate image caption via HuggingFace BLIP
    console.log('🖼️  [detect-movie] Captioning image with BLIP...');
    const caption = await captionImage(base64Clean);
    console.log(`📝 [detect-movie] Caption: "${caption}"`);

    // Step 2: Search TMDB using the caption as a query
    console.log('🎬 [detect-movie] Searching TMDB...');
    const movie = await searchMovieByCaption(caption);

    if (movie) {
      console.log(`✅ [detect-movie] Found: "${movie.title}" (${movie.year})`);
    } else {
      console.log('⚠️  [detect-movie] No TMDB match found for caption');
    }

    return res.json({ success: true, caption, movie });

  } catch (error) {
    console.error('❌ [detect-movie] Error:', error.message);

    // Surface actionable hints for common failures
    const hint =
      error.message.includes('HF_API_KEY') ? 'Set HF_API_KEY in your .env file' :
      error.message.includes('OMDB_API_KEY') ? 'Set OMDB_API_KEY in your .env file — free key at http://www.omdbapi.com/apikey.aspx' :
      error.response?.status === 503 ? 'HuggingFace model is loading, retry in ~20 seconds' :
      error.response?.status === 401 ? 'Invalid API key — check HF_API_KEY or TMDB_API_KEY' :
      undefined;

    return res.status(500).json({
      success: false,
      error: error.message,
      ...(hint && { hint }),
    });
  }
});

module.exports = router;
