const axios = require('axios');

const HF_API_KEY = process.env.HF_API_KEY;

// LLaVA 1.5 — free vision-language model, understands images + text prompts
const MODEL_URL = 'https://api-inference.huggingface.co/models/llava-hf/llava-1.5-7b-hf';

const PROMPT = `Identify this movie screenshot. Reply ONLY with a JSON object using these exact keys:
{"title":"","year":"","genre":"","director":"","description":"","actors":"","confidence":"Low|Medium|High","reasoning":""}`;

/**
 * Sends a base64 image + prompt to HuggingFace LLaVA and returns structured movie data.
 * @param {string} base64Image - Raw base64 (no data URI prefix)
 * @returns {Promise<Object>}
 */
async function analyzeImage(base64Image) {
  if (!HF_API_KEY) throw new Error('HF_API_KEY is not set in environment variables');

  const response = await axios.post(
    MODEL_URL,
    {
      inputs: {
        image: base64Image,
        question: PROMPT,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000, // LLaVA can be slow on cold start
    }
  );

  // HF visual-QA response: [{ answer: "..." }] or { generated_text: "..." }
  const raw =
    response.data?.[0]?.answer ||
    response.data?.[0]?.generated_text ||
    response.data?.generated_text || '';

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`LLaVA returned non-JSON response: ${raw.slice(0, 200)}`);

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    success: true,
    title:       parsed.title       || 'Unknown',
    year:        parsed.year        || 'Unknown',
    genre:       parsed.genre       || 'Unknown',
    director:    parsed.director    || 'Unknown',
    description: parsed.description || '',
    actors:      parsed.actors      || 'Unknown',
    confidence:  parsed.confidence  || 'Medium',
    reasoning:   parsed.reasoning   || '',
  };
}

module.exports = { analyzeImage };
