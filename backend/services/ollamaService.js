const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash';
const MAX_RETRIES = 3;

// Retry with exponential backoff on 429 rate-limit responses
async function analyzeImage(base64Image, attempt = 1) {
  const prompt = `Identify this movie screenshot. Return ONLY a JSON object with keys: title, year, genre, director, description, actors, confidence, reasoning.`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const response = await axios.post(url, {
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { mimeType: "image/jpeg", data: base64Image } }
        ]
      }]
    }, { timeout: 30000 });

    const text = response.data.candidates[0].content.parts[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);

    return {
      success: true,
      title: parsed.title || 'Unknown',
      year: parsed.year || 'Unknown',
      genre: parsed.genre || 'Unknown',
      director: parsed.director || 'Unknown',
      description: parsed.description || '',
      actors: parsed.actors || 'Unknown',
      confidence: parsed.confidence || 'Medium',
      reasoning: parsed.reasoning || ''
    };
  } catch (err) {
    const is429 = err.response?.status === 429;

    if (is429 && attempt < MAX_RETRIES) {
      // Honour Retry-After header if present, else exponential backoff: 5s, 10s, 20s
      const retryAfter = err.response?.headers?.['retry-after'];
      const delay = retryAfter ? parseInt(retryAfter) * 1000 : 5000 * attempt;
      console.warn(`⏳ Gemini rate limited. Retrying in ${delay / 1000}s (attempt ${attempt}/${MAX_RETRIES})...`);
      await new Promise(r => setTimeout(r, delay));
      return analyzeImage(base64Image, attempt + 1);
    }

    if (is429) throw new Error('Gemini rate limit exceeded. Please wait a minute and try again.');
    throw err;
  }
}

module.exports = { analyzeImage };
