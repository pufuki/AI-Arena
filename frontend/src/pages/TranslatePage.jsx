import React, { useState } from "react";
import { apiPost } from "../api";

// ─── Translation ──────────────────────────────────────────────────────────────
export function TranslatePage() {
  const [text, setText]     = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const examples = [
    "Hello, how are you doing today?",
    "Artificial intelligence is transforming the world.",
    "I would like to order a coffee, please.",
  ];

  async function translate() {
    if (!text.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const data = await apiPost("/translate", { text });
      setResult(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🌐 Translation</div>
        <div className="page-desc">Translate English text to French using a neural machine translation model.</div>
        <div className="model-badge">📦 Helsinki-NLP/opus-mt-en-fr</div>
      </div>

      <div className="card">
        <div className="card-title">English Input</div>
        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder="Type or paste English text here…" rows={5} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
          {examples.map((ex, i) => (
            <button key={i} className="btn btn-ghost" style={{ fontSize: "11px", padding: "5px 10px" }}
              onClick={() => setText(ex)}>Example {i + 1}</button>
          ))}
        </div>
        <div style={{ marginTop: "14px", display: "flex", gap: "10px" }}>
          <button className="btn btn-primary" onClick={translate} disabled={loading || !text.trim()}>
            {loading ? "Translating…" : "▶ Translate EN→FR"}
          </button>
          <button className="btn btn-ghost" onClick={() => { setText(""); setResult(null); setError(""); }}>Clear</button>
        </div>
      </div>

      {loading && <div className="loading-row"><div className="spinner" />Running translation model…</div>}
      {error && <div className="error-msg">⚠️ {error}</div>}

      {result && (
        <div className="card">
          <div className="card-title">French Translation</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "6px" }}>🇬🇧 ENGLISH</div>
              <div className="result-box" style={{ borderLeftColor: "var(--muted)" }}>{result.original}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "var(--accent)", marginBottom: "6px" }}>🇫🇷 FRENCH</div>
              <div className="result-box">{result.translated}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TranslatePage;
