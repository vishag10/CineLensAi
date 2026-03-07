const axios = require('axios');

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2-vision';

/**
 * Send an image to the local Ollama llama3.2-vision model.
 * @param {string} base64Image - Base64 encoded image string (without prefix)
 * @returns {Promise<object>} - Parsed movie data from AI response
 */
async function analyzeImage(base64Image) {
  const prompt = `You are CineLens, an expert film analyst AI. Analyze this screenshot or still image from a movie.

Provide your response in the following JSON format ONLY (no extra text):
{
  "title": "Best guess movie title or 'Unknown'",
  "year": "Release year or 'Unknown'",
  "genre": "Primary genre (Action/Drama/Sci-Fi/Horror/Comedy/Thriller/Fantasy/Romance/Animation/Documentary)",
  "director": "Director name or 'Unknown'",
  "description": "2-3 sentence visual description of what you see in this scene",
  "actors": "Any recognizable actors or 'Unknown'",
  "confidence": "High/Medium/Low",
  "reasoning": "Brief explanation of how you identified this film"
}

Focus on: costumes, setting, lighting style, color grading, visual effects, recognizable faces, props, and cinematography style.`;

  try {
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: OLLAMA_MODEL,
      prompt: prompt,
      images: [base64Image],
      stream: false,
      format: 'json'
    }, {
      timeout: 120000 // 2 min timeout for large model inference
    });

    const rawText = response.data.response;
    
    // Parse the JSON response
    try {
      const parsed = JSON.parse(rawText);
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
    } catch (parseError) {
      // Try to extract key information from unstructured response
      console.warn('⚠️  Could not parse JSON, extracting from raw text...');
      return {
        success: true,
        title: extractField(rawText, 'title') || 'Unknown',
        year: extractField(rawText, 'year') || 'Unknown',
        genre: extractField(rawText, 'genre') || 'Unknown',
        director: extractField(rawText, 'director') || 'Unknown',
        description: rawText.substring(0, 300),
        actors: 'Unknown',
        confidence: 'Low',
        reasoning: rawText.substring(0, 200)
      };
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Ollama is not running. Please start it with: ollama serve');
    }
    throw new Error(`Ollama inference failed: ${error.message}`);
  }
}

function extractField(text, fieldName) {
  const regex = new RegExp(`"${fieldName}"\\s*:\\s*"([^"]+)"`, 'i');
  const match = text.match(regex);
  return match ? match[1] : null;
}

module.exports = { analyzeImage };
