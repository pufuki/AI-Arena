import React, { useState } from "react";
import { apiPost } from "../api";

export default function GenerationPage() {
  const [prompt, setPrompt]   = useState("");
  const [tokens, setTokens]   = useState(200);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const templates = [
    { label: "Story Starter", text: "Once upon a time in a futuristic city where AI and humans coexisted," },
    { label: "Tech Explainer", text: "Explain quantum computing to a 10-year-old:" },
    { label: "Business Email", text: "Write a professional email requesting a meeting with a potential client:" },
    { label: "Code Comment", text: "Write a Python function that calculates the Fibonacci sequence. Add detailed comments:" },
  ];

  async function generate() {
    if (!prompt.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const data = await apiPost("/generate", { prompt, max_new_tokens: tokens });
      setResult(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">✍️ Text Generation</div>
        <div className="page-desc">Give the AI a prompt and watch it write. Powered by Mistral-7B.</div>
        <div className="model-badge">📦 mistralai/Mistral-7B-Instruct-v0.1</div>
      </div>

      <div className="card">
        <div className="card-title">Prompt Templates</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {templates.map(t => (
            <button key={t.label} className="btn btn-ghost" style={{ fontSize: "11px", padding: "5px 12px" }}
              onClick={() => setPrompt(t.text)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Your Prompt</div>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Write your prompt here…"
          rows={5}
        />

        <div style={{ marginTop: "16px" }}>
          <label className="field-label">Max tokens to generate: <b style={{ color: "var(--accent)" }}>{tokens}</b></label>
          <div className="range-row">
            <span>50</span>
            <input type="range" min={50} max={500} step={10} value={tokens} onChange={e => setTokens(+e.target.value)} />
            <span>500</span>
          </div>
        </div>

        <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
          <button className="btn btn-primary" onClick={generate} disabled={loading || !prompt.trim()}>
            {loading ? "Generating…" : "▶ Generate"}
          </button>
          <button className="btn btn-ghost" onClick={() => { setPrompt(""); setResult(null); setError(""); }}>
            Clear
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-row">
          <div className="spinner" />
          Generating text (may take 15–30s on first run)…
        </div>
      )}

      {error && <div className="error-msg">⚠️ {error}</div>}

      {result && (
        <div className="card">
          <div className="card-title">Generated Output</div>
          <div className="stats-row">
            <div className="stat-chip">Words: <b>{result.tokens_generated}</b></div>
            <div className="stat-chip">Model: <b>Mistral-7B</b></div>
          </div>
          <div className="result-box">{result.generated_text}</div>
        </div>
      )}
    </div>
  );
}
