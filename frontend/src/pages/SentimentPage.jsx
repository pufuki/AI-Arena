import React, { useState } from "react";
import { apiPost } from "../api";

const COLOR_MAP = {
  POSITIVE: "#22c55e",
  NEGATIVE: "#ef4444",
  NEUTRAL:  "#64748b",
};
const EMOJI_MAP = { POSITIVE: "😊", NEGATIVE: "😞", NEUTRAL: "😐" };

export default function SentimentPage() {
  const [text, setText]     = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const examples = [
    "I absolutely love this product! It's amazing and exceeded all my expectations.",
    "This is the worst experience I've ever had. Completely disappointed.",
    "The weather today is okay. Nothing special.",
  ];

  async function analyze() {
    if (!text.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const data = await apiPost("/sentiment", { text });
      setResult(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🧠 Sentiment Analysis</div>
        <div className="page-desc">Detect the emotional tone of any text — positive, negative, or neutral.</div>
        <div className="model-badge">📦 distilbert-base-uncased-finetuned-sst-2-english</div>
      </div>

      <div className="card">
        <div className="card-title">Input Text</div>
        <label className="field-label">Enter your sentence or paragraph</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type something… e.g. 'I love sunny days!'"
          rows={5}
        />

        {/* Example buttons */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
          {examples.map((ex, i) => (
            <button key={i} className="btn btn-ghost" style={{ fontSize: "11px", padding: "5px 10px" }}
              onClick={() => setText(ex)}>
              Example {i + 1}
            </button>
          ))}
        </div>

        <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
          <button className="btn btn-primary" onClick={analyze} disabled={loading || !text.trim()}>
            {loading ? "Analyzing…" : "▶ Analyze"}
          </button>
          <button className="btn btn-ghost" onClick={() => { setText(""); setResult(null); setError(""); }}>
            Clear
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-row">
          <div className="spinner" />
          Running inference on HuggingFace API…
        </div>
      )}

      {error && <div className="error-msg">⚠️ {error}</div>}

      {result && (
        <div className="card">
          <div className="card-title">Result</div>
          <div className="sentiment-result">
            <div className={`sentiment-badge ${result.prediction}`}>
              {EMOJI_MAP[result.prediction] || "🔍"} {result.prediction} · {result.confidence}%
            </div>

            <div className="score-bars">
              {result.all_scores.map((s) => (
                <div className="score-row" key={s.label}>
                  <span className="score-label">{s.label}</span>
                  <div className="score-bar-track">
                    <div
                      className="score-bar-fill"
                      style={{
                        width: `${s.score}%`,
                        background: COLOR_MAP[s.label] || "var(--accent)",
                      }}
                    />
                  </div>
                  <span className="score-val">{s.score}%</span>
                </div>
              ))}
            </div>

            <div style={{ fontSize: "12px", color: "var(--muted)", borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
              Analyzed: <em style={{ color: "var(--text)" }}>"{result.input.slice(0, 80)}{result.input.length > 80 ? "…" : ""}"</em>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
