"""
AI Studio - Backend API
Uses Hugging Face Inference API (free, no GPU needed)
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
import base64
import json

app = FastAPI(title="AI Studio API", version="1.0.0")

# Allow React frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
"""app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)"""

# ─── Config ──────────────────────────────────────────────────────────────────
HF_API_KEY = os.getenv("HF_API_KEY", "")   # set in .env or export HF_API_KEY=hf_...
HF_BASE = "https://router.huggingface.co/hf-inference/models"

MODELS = {
    "sentiment":    "distilbert/distilbert-base-uncased-finetuned-sst-2-english",
    "generation": "EleutherAI/gpt-neo-125m",    
    "image_class":  "google/vit-base-patch16-224",
    "speech":       "openai/whisper-large-v3",
    "summarize":    "facebook/bart-large-cnn",
    "ner":          "dslim/bert-base-NER",
    "translation":  "Helsinki-NLP/opus-mt-en-fr",
    "qa":           "deepset/roberta-base-squad2",
}

def hf_headers():
    if not HF_API_KEY:
        raise HTTPException(
            status_code=400,
            detail="HF_API_KEY not set. Add it to backend/.env as HF_API_KEY=hf_xxxx"
        )
    return {"Authorization": f"Bearer {HF_API_KEY}"}


async def call_hf(model_key: str, payload: dict, timeout: int = 60):
    """Generic helper to POST to Hugging Face Inference API."""
    url = f"{HF_BASE}/{MODELS[model_key]}"
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.post(url, headers=hf_headers(), json=payload)
    if resp.status_code == 503:
        raise HTTPException(503, "Model is loading on HF servers, retry in ~20s")
    if resp.status_code != 200:
        raise HTTPException(resp.status_code, f"HF API error: {resp.text}")
    return resp.json()


'''sync def call_hf_binary(model_key: str, data: bytes, content_type: str = "image/jpeg", timeout: int = 90):
    """POST raw bytes (audio / image) to HF Inference API."""
    url = f"{HF_BASE}/{MODELS[model_key]}"
    headers = {
        "Authorization": f"Bearer {HF_API_KEY}",
        "Content-Type": content_type,
        "Accept": "application/json",
    }
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.post(url, headers=headers, content=data)
    if resp.status_code == 503:
        raise HTTPException(503, "Model is loading on HF servers, retry in ~20s")
    if resp.status_code != 200:
        raise HTTPException(resp.status_code, f"HF API error: {resp.text}")
    return resp.json()'''

async def call_hf_binary(model_key: str, data: bytes, content_type: str = "image/jpeg", timeout: int = 90):
    """POST raw bytes (audio / image) to HF Inference API."""
    url = f"{HF_BASE}/{MODELS[model_key]}"
    headers = {**hf_headers(), "Content-Type": content_type}
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.post(url, headers=headers, content=data)

# ─── Request / Response Models ────────────────────────────────────────────────

class TextRequest(BaseModel):
    text: str

class GenerationRequest(BaseModel):
    prompt: str
    max_new_tokens: int = 200

class SummarizeRequest(BaseModel):
    text: str
    min_length: int = 30
    max_length: int = 130

class QARequest(BaseModel):
    question: str
    context: str

class TranslateRequest(BaseModel):
    text: str


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "AI Studio API is running 🚀"}


@app.get("/models")
def list_models():
    """Return all model names so frontend can display them."""
    return MODELS


# 1. Sentiment Analysis
@app.post("/sentiment")
async def sentiment_analysis(req: TextRequest):
    result = await call_hf("sentiment", {"inputs": req.text})
    # result is list of list of dicts
    labels = result[0] if isinstance(result[0], list) else result
    labels.sort(key=lambda x: x["score"], reverse=True)
    return {
        "input": req.text,
        "prediction": labels[0]["label"],
        "confidence": round(labels[0]["score"] * 100, 2),
        "all_scores": [
            {"label": l["label"], "score": round(l["score"] * 100, 2)}
            for l in labels
        ],
    }


# 2. Text Generation
@app.post("/generate")
async def text_generation(req: GenerationRequest):
    payload = {
        "inputs": req.prompt,
        "parameters": {
            "max_new_tokens": req.max_new_tokens,
            "temperature": 0.7,
            "do_sample": True,
            "return_full_text": False,
        },
    }
    result = await call_hf("generation", payload, timeout=90)
    generated = result[0]["generated_text"] if isinstance(result, list) else result.get("generated_text", "")
    return {
        "prompt": req.prompt,
        "generated_text": generated.strip(),
        "tokens_generated": len(generated.split()),
    }


# 3. Image Classification
@app.post("/classify-image")
async def image_classification(file: UploadFile = File(...)):
    allowed = {"image/jpeg", "image/png", "image/jpg", "image/webp"}
    if file.content_type not in allowed:
        raise HTTPException(400, "Only JPG/PNG images are supported")

    image_bytes = await file.read()
    result = await call_hf_binary("image_class", image_bytes)

    result.sort(key=lambda x: x["score"], reverse=True)
    return {
        "filename": file.filename,
        "top_prediction": result[0]["label"],
        "confidence": round(result[0]["score"] * 100, 2),
        "top5": [
            {"label": r["label"], "score": round(r["score"] * 100, 2)}
            for r in result[:5]
        ],
    }


# 4. Speech Recognition (Audio Transcription)
@app.post("/transcribe")
async def speech_recognition(file: UploadFile = File(...)):
    allowed_types  = {"audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp3", "audio/ogg", "audio/flac"}
    allowed_ext    = {".mp3", ".wav", ".ogg", ".flac", ".m4a"}
    ext = os.path.splitext(file.filename or "")[-1].lower()

    if file.content_type not in allowed_types and ext not in allowed_ext:
        raise HTTPException(400, "Only MP3/WAV/OGG/FLAC audio files are supported")

    audio_bytes = await file.read()
    content_type = file.content_type or "audio/mpeg"
    result = await call_hf_binary("speech", audio_bytes, content_type=content_type, timeout=120)
    '''audio_bytes = await file.read()
    result = await call_hf_binary("image_class", image_bytes, content_type=file.content_type)'''

    transcript = result.get("text", "") if isinstance(result, dict) else str(result)
    return {
        "filename": file.filename,
        "transcript": transcript.strip(),
        "word_count": len(transcript.split()),
        "char_count": len(transcript),
    }


# 5. Text Summarization
@app.post("/summarize")
async def summarize(req: SummarizeRequest):
    payload = {
        "inputs": req.text,
        "parameters": {"min_length": req.min_length, "max_length": req.max_length},
    }
    result = await call_hf("summarize", payload, timeout=60)
    summary = result[0]["summary_text"] if isinstance(result, list) else result.get("summary_text", "")
    return {
        "original_length": len(req.text.split()),
        "summary": summary.strip(),
        "summary_length": len(summary.split()),
    }


# 6. Named Entity Recognition (NER)
@app.post("/ner")
async def named_entity_recognition(req: TextRequest):
    result = await call_hf("ner", {"inputs": req.text})
    entities = []
    for ent in result:
        entities.append({
            "word":  ent.get("word", ""),
            "label": ent.get("entity_group") or ent.get("entity", ""),
            "score": round(ent.get("score", 0) * 100, 2),
        })
    return {"input": req.text, "entities": entities, "count": len(entities)}


# 7. Translation (English → French)
@app.post("/translate")
async def translate(req: TranslateRequest):
    result = await call_hf("translation", {"inputs": req.text})
    translated = result[0]["translation_text"] if isinstance(result, list) else result.get("translation_text", "")
    return {
        "original": req.text,
        "translated": translated,
        "source_lang": "English",
        "target_lang": "French",
    }


# 8. Question Answering
@app.post("/qa")
async def question_answering(req: QARequest):
    payload = {"inputs": {"question": req.question, "context": req.context}}
    result = await call_hf("qa", payload)
    return {
        "question": req.question,
        "answer": result.get("answer", ""),
        "confidence": round(result.get("score", 0) * 100, 2),
        "start": result.get("start"),
        "end": result.get("end"),
    }
