const { search } = require('duck-duck-scrape');

/**
 * Search DuckDuckGo for movie verification.
 * @param {string} query - Search query derived from AI visual description
 * @returns {Promise<object>} - Top search result
 */
async function searchMovie(query) {
  try {
    const results = await search(query, {
      safeSearch: 'OFF'
    });

    if (!results || !results.results || results.results.length === 0) {
      return {
        success: false,
        message: 'No results found'
      };
    }

    const top = results.results[0];
    const filtered = results.results
      .filter(r => r.title && r.description)
      .slice(0, 3);

    return {
      success: true,
      topResult: {
        title: top.title,
        url: top.url,
        snippet: top.description
      },
      allResults: filtered.map(r => ({
        title: r.title,
        url: r.url,
        snippet: r.description
      }))
    };
  } catch (error) {
    console.error('DuckDuckGo search failed:', error.message);
    return {
      success: false,
      message: `Search failed: ${error.message}`
    };
  }
}

/**
 * Build an optimized search query from AI analysis results
 */
function buildSearchQuery(aiResult) {
  const parts = [];
  if (aiResult.title && aiResult.title !== 'Unknown') {
    parts.push(`"${aiResult.title}"`);
  }
  if (aiResult.description) {
    // Take first sentence from description for keywords
    const firstSentence = aiResult.description.split('.')[0];
    parts.push(firstSentence);
  }
  if (aiResult.year && aiResult.year !== 'Unknown') {
    parts.push(aiResult.year);
  }
  parts.push('film movie');
  return parts.join(' ');
}

module.exports = { searchMovie, buildSearchQuery };
