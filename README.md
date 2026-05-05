# AI Studio - 8 Models, No GPU Required

A full-stack AI web application with **React** frontend and **FastAPI** backend.  
All models run on the **Hugging Face Inference API** - completely free, no GPU, no local model downloads.

---

## Quick Start

### Step 1 - Get a Free HuggingFace API Key

1. Go to → https://huggingface.co/join (free account)
2. Go to → https://huggingface.co/settings/tokens
3. Click **"New token"** → name it `ai-studio` → role **Read** → Create
4. Copy the token (starts with `hf_...`)

---

### Step 2 - Set Up the Backend

```bash
# Go into backend folder
cd ai-studio/backend

# Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set your API key
cp .env.example .env
# Edit .env and replace hf_xxxx... with your actual token

# Start the server
HF_API_KEY=hf_your_token uvicorn main:app --reload --port 8000

# OR on Windows PowerShell:
# $env:HF_API_KEY="hf_your_token"; uvicorn main:app --reload --port 8000
```

Backend runs at: **http://localhost:8000**  
Docs available at: **http://localhost:8000/docs** (Swagger UI)

---

### Step 3 - Set Up the Frontend

```bash
# In a new terminal
cd ai-studio/frontend

# Install Node packages
npm install

# Start React app
npm start
```

Frontend runs at: **http://localhost:3000**

---

## Features - 8 AI Models

| # | Feature | Input | Output |
|---|---------|-------|--------|
| 1 | **Sentiment Analysis** | Text | Positive/Negative + confidence |
| 2 | **Text Generation** | Prompt | Generated continuation |
| 3 | **Image Classification** | JPG/PNG image | Top-5 labels + confidence |
| 4 | **Speech Recognition** | MP3/WAV audio | Full transcript |
| 5 | **Text Summarization** | Long text | Condensed summary |
| 6 | **Named Entity Recognition** | Text | People, orgs, places, misc |
| 7 | **Translation (EN→FR)** | English text | French translation |
| 8 | **Question Answering** | Context + Question | Extracted answer |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACE                        │
│              React + CSS (Dark Theme)                    │
│   Sidebar Nav │ Task Pages │ File Upload │ Results       │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP (fetch API)
┌────────────────────────▼────────────────────────────────┐
│                   FASTAPI BACKEND                        │
│              Python 3.10+ · Port 8000                    │
│  /sentiment │ /generate │ /classify-image │ /transcribe  │
│  /summarize │ /ner      │ /translate      │ /qa          │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS (httpx)
┌────────────────────────▼────────────────────────────────┐
│           HUGGING FACE INFERENCE API                     │
│         https://api-inference.huggingface.co             │
│    Free tier · No GPU · Pre-warmed models (cold start    │
│    may take ~20s on first request)                       │
└─────────────────────────────────────────────────────────┘
```

---

## Common Issues

| Problem | Solution |
|---------|----------|
| `HF_API_KEY not set` | Add your key to `.env` or export as env variable |
| `503 Model is loading` | Wait 20–30s and retry — HF warms up models on first call |
| `CORS error` in browser | Make sure backend is running on port 8000 |
| Large audio file slow | Whisper large processes ~1 min audio in ~30-60s, this is normal |
| `npm install` fails | Use Node.js 18+ (`node --version`) |

---

## API Reference (Backend Endpoints)

All endpoints accept and return JSON. File endpoints use `multipart/form-data`.

```
GET  /              → Health check
GET  /models        → List all model names

POST /sentiment     → { text }                          → { prediction, confidence, all_scores }
POST /generate      → { prompt, max_new_tokens }        → { generated_text, tokens_generated }
POST /classify-image→ form: file (image)                → { top_prediction, confidence, top5 }
POST /transcribe    → form: file (audio)                → { transcript, word_count, char_count }
POST /summarize     → { text }                          → { summary, original_length, summary_length }
POST /ner           → { text }                          → { entities, count }
POST /translate     → { text }                          → { original, translated }
POST /qa            → { question, context }             → { answer, confidence }
```

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vanilla CSS, Google Fonts
- **Backend**: FastAPI, httpx (async HTTP), python-multipart
- **AI Platform**: Hugging Face Inference API (free tier)
