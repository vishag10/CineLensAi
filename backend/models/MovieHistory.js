const mongoose = require('mongoose');

const movieHistorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: String,
    default: 'Unknown'
  },
  genre: {
    type: String,
    default: 'Unknown'
  },
  director: {
    type: String,
    default: 'Unknown'
  },
  description: {
    type: String,
    default: ''
  },
  confidence: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  method: {
    type: String,
    enum: ['Model Only', 'Model + Search'],
    default: 'Model Only'
  },
  imageData: {
    type: String, // base64 thumbnail (truncated for storage)
    default: ''
  },
  searchResult: {
    url: String,
    snippet: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MovieHistory', movieHistorySchema);
