import React, { useEffect, useState } from "react";

const FEATURES = [
  {
    title: "Sentiment Analysis",
    desc: "Detect positive, negative, or neutral emotions in any text with confidence scores.",
    model: "DistilBERT",
    color: "#22c55e",
    id: "sentiment",
  },
  {
    title: "Text Generation",
    desc: "Prompt the AI to write stories, emails, code comments, and more.",
    model: "GPT-2",
    color: "#00e5ff",
    id: "generation",
  },
  {
    title: "Image Classification",
    desc: "Upload any image and get top-5 predictions with confidence percentages.",
    model: "Google ViT",
    color: "#a855f7",
    id: "image",
  },
  {
    title: "Speech Recognition",
    desc: "Transcribe MP3, WAV, or OGG audio files into accurate text instantly.",
    model: "Whisper v3",
    color: "#f59e0b",
    id: "speech",
  },
  {
    title: "Summarization",
    desc: "Condense long articles into crisp summaries with compression stats.",
    model: "BART-large",
    color: "#f472b6",
    id: "summarize",
  },
  {
    title: "Named Entity Recognition",
    desc: "Extract people, organizations, locations, and misc entities from text.",
    model: "BERT-NER",
    color: "#34d399",
    id: "ner",
  },
  {
    title: "Translation",
    desc: "Neural machine translation from English to French, fast and accurate.",
    model: "MarianMT",
    color: "#60a5fa",
    id: "translate",
  },
  {
    title: "Question Answering",
    desc: "Provide context and ask anything — the AI extracts the exact answer.",
    model: "RoBERTa",
    color: "#fb923c",
    id: "qa",
  },
];
const ARCH = [
  { label: "User Interface", sub: "React 18 · Dark Theme · Drag & Drop"},
  { label: "Task Router",    sub: "8 AI endpoints · Dynamic selection"},
  { label: "FastAPI Backend", sub: "Python · Async · CORS enabled"},
  { label: "HuggingFace API", sub: "Free Inference · No GPU needed"},
];

const STATS = [
  { value: "8",     label: "AI Models"      },
  { value: "100%",  label: "Free to Use"    },
  { value: "0",     label: "GPU Required"   },
  { value: "4",     label: "Input Types"    },
];

// Animated counter
function Counter({ target }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const num = parseInt(target) || 0;
    if (!num) { setVal(target); return; }
    let start = 0;
    const step = Math.ceil(num / 40);
    const t = setInterval(() => {
      start += step;
      if (start >= num) { setVal(target); clearInterval(t); }
      else setVal(start + (target.toString().includes("%") ? "%" : ""));
    }, 30);
    return () => clearInterval(t);
  }, [target]);
  return <span>{val || target}</span>;
}

export default function HomePage({ onNavigate }) {
  const [apiStatus, setApiStatus] = useState("checking");

  useEffect(() => {
    fetch("http://localhost:8000/")
      .then(r => r.ok ? setApiStatus("online") : setApiStatus("offline"))
      .catch(() => setApiStatus("offline"));
  }, []);

  return (
    <div className="home-page">

      {/* ── Hero ── */}
      <section className="hero-section">
        <div className="hero-eyebrow">
          <span className="hero-dot" />
          Powered by Hugging Face Inference API
        </div>

        <h1 className="hero-title">
          AI Studio
          <span className="hero-title-accent"> — 8 Models.</span>
          <br />No GPU. No Setup.
        </h1>

        <p className="hero-desc">
          A full-stack AI playground built with React + FastAPI. Run sentiment analysis,
          generate text, classify images, transcribe audio, and more — all through
          free cloud APIs. No local model downloads required.
        </p>

        <div className="hero-actions">
          <button className="btn btn-primary hero-btn" onClick={() => onNavigate("sentiment")}>
            ▶ Try Sentiment Analysis
          </button>
          <button className="btn btn-ghost hero-btn" onClick={() => onNavigate("generation")}>
            Try Text Generation
          </button>
        </div>

        <div className={`api-status-bar ${apiStatus}`}>
          <span className={`status-dot-sm ${apiStatus}`} />
          Backend API:&nbsp;
          <b>{apiStatus === "checking" ? "Checking…" : apiStatus === "online" ? "Online" : "Offline — start uvicorn"}</b>
          &nbsp;·&nbsp;http://localhost:8000
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="stats-section">
        {STATS.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-big"><Counter target={s.value} /></div>
            <div className="stat-name">{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── Features Grid ── */}
      <section className="section">
        <div className="section-header">
          <div className="section-tag">CAPABILITIES</div>
          <h2 className="section-title">8 AI Features, One Interface</h2>
          <p className="section-sub">Click any card to jump straight into that feature.</p>
        </div>

        <div className="features-grid">
          {FEATURES.map((f) => (
            <div
              key={f.id}
              className="feature-card"
              style={{ "--card-color": f.color }}
              onClick={() => onNavigate(f.id)}
            >
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
              <div className="feature-footer">
                <span className="feature-model">📦 {f.model}</span>
                <span className="feature-arrow">→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

  

      {/* ── Tech Stack ── */}
      <section className="section">
        <div className="section-header">
          <div className="section-tag">TECH STACK</div>
          <h2 className="section-title">Built With</h2>
        </div>

        <div className="stack-grid">
          {[
            { name: "React 18",      role: "Frontend UI"},
            { name: "FastAPI",       role: "Backend API"},
            { name: "HuggingFace",   role: "AI Model Inference"},
            { name: "Python 3.11",   role: "Runtime"},
            { name: "httpx",         role: "Async HTTP Client"},
            { name: "Uvicorn",       role: "ASGI Server"},
          ].map(s => (
            <div key={s.name} className="stack-chip">
              <span className="stack-icon">{s.icon}</span>
              <div>
                <div className="stack-name">{s.name}</div>
                <div className="stack-role">{s.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Quick Start ── */}
      <section className="section">
        <div className="section-header">
          <div className="section-tag">QUICK START</div>
          <h2 className="section-title">Get Running in 3 Steps</h2>
        </div>

        <div className="steps-list">
          {[
            {
              num: "01",
              title: "Get a Free HuggingFace API Key",
              code: "https://huggingface.co/settings/tokens",
              note: "Free account · Read permission · No credit card",
            },
            {
              num: "02",
              title: "Start the Backend",
              code: "HF_API_KEY=hf_xxx uvicorn main:app --reload",
              note: "Runs on http://localhost:8000",
            },
            {
              num: "03",
              title: "Start the Frontend",
              code: "npm install && npm start",
              note: "Opens at http://localhost:3000",
            },
          ].map(s => (
            <div key={s.num} className="step-row">
              <div className="step-num">{s.num}</div>
              <div className="step-content">
                <div className="step-title">{s.title}</div>
                <div className="step-code">{s.code}</div>
                <div className="step-note">{s.note}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="home-footer">
        Built for internship project · React + FastAPI + HuggingFace Inference API · No GPU required
      </div>
    </div>
  );
}
