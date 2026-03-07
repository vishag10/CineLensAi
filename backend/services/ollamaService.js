const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash';

async function analyzeImage(base64Image) {
  const prompt = `Identify this movie screenshot. Return ONLY a JSON object with keys: title, year, genre, director, description, actors, confidence, reasoning.`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

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
}

module.exports = { analyzeImage };
