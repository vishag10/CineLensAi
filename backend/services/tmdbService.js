const axios = require('axios');

const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_BASE = 'https://www.omdbapi.com';

// Strip BLIP filler phrases before searching
function captionToQuery(caption) {
  const fillers = ['a photo of', 'an image of', 'a picture of', 'a screenshot of', 'a still from'];
  let query = caption.toLowerCase();
  fillers.forEach(f => { query = query.replace(f, ''); });
  return query.trim();
}

/**
 * Searches OMDb for a movie matching the BLIP caption.
 * OMDb free tier: 1,000 req/day — key at http://www.omdbapi.com/apikey.aspx
 * @param {string} caption - Image caption from BLIP
 * @returns {Promise<Object|null>}
 */
async function searchMovieByCaption(caption) {
  if (!OMDB_API_KEY) throw new Error('OMDB_API_KEY is not set in environment variables');

  const query = captionToQuery(caption);

  const response = await axios.get(OMDB_BASE, {
    params: { apikey: OMDB_API_KEY, s: query, type: 'movie' },
    timeout: 10000,
  });

  const data = response.data;
  // OMDb returns { Response: 'False', Error: '...' } when nothing found
  if (data.Response === 'False' || !data.Search?.length) return null;

  const top = data.Search[0];
  return {
    imdbId: top.imdbID,
    title: top.Title,
    year: top.Year,
    posterUrl: top.Poster !== 'N/A' ? top.Poster : null,
    imdbUrl: `https://www.imdb.com/title/${top.imdbID}`,
  };
}

module.exports = { searchMovieByCaption };
