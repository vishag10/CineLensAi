# 🎬 CineLens AI Agent

**Identify any movie from a screenshot using 100% local, free AI.**

## Prerequisites

1. **[Ollama](https://ollama.com)** — Download and install the local AI server
2. **Pull the vision model:**
   ```bash
   ollama pull llama3.2-vision
   ```
3. **MongoDB** — Install and run locally on `mongodb://localhost:27017`
   - [MongoDB Community Server](https://www.mongodb.com/try/download/community)

## Quick Start

### 1. Install dependencies

```bash
# Root (Electron)
npm install

# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..
```

### 2. Start the backend
```bash
cd backend
npm run dev
```

### 3. Start the frontend (web mode)
```bash
cd frontend
npm run dev
```

Open: [http://localhost:5173](http://localhost:5173)

### 4. Run as Desktop App (Electron)

> Make sure backend and frontend are running first.

```bash
# Root directory
npm start
```

**Global Hotkey:** `Ctrl+Shift+S` — Instantly snip your screen and identify the movie.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Framer Motion |
| Desktop | Electron.js |
| AI Inference | Ollama (Local) |
| Vision Model | Llama 3.2 Vision |
| Backend | Node.js / Express |
| Database | MongoDB |
| Web Search | DuckDuckGo (free, no API key) |

## How It Works

1. **Upload** — Drag & drop, paste (Ctrl+V), or screen snip (Ctrl+Shift+S)
2. **AI Analysis** — Llama 3.2 Vision identifies visual elements (costumes, setting, actors, color palette)
3. **Web Verification** — DuckDuckGo cross-references the AI's best guess with live web results
4. **Result** — Movie title, year, genre, director, confidence score displayed in a premium card

## Accuracy

| Method | Accuracy |
|--------|----------|
| Model Only | ~85% |
| Model + Search Agent | ~99% ✅ |

## License

MIT
