// ─── Summarize ────────────────────────────────────────────────────────────────
import React, { useState } from "react";
import { apiPost } from "../api";

const SAMPLE_TEXT = `Artificial intelligence (AI) is rapidly transforming multiple industries, from healthcare to finance. Machine learning models can now diagnose diseases, predict market movements, and generate creative content. However, the technology also raises important ethical questions about privacy, bias, and the future of employment. Researchers and policymakers are actively working on frameworks to govern AI development responsibly. The next decade will likely see even more profound changes as AI systems become more capable and widely deployed across society.`;

export function SummarizePage() {
  const [text, setText]     = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  async function summarize() {
    if (!text.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const data = await apiPost("/summarize", { text });
      setResult(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">📄 Text Summarization</div>
        <div className="page-desc">Condense long articles or paragraphs into concise summaries.</div>
        <div className="model-badge">📦 facebook/bart-large-cnn</div>
      </div>

      <div className="card">
        <div className="card-title">Text to Summarize</div>
        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder="Paste a long article or paragraph here…" rows={8} />
        <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
          <button className="btn btn-ghost" style={{ fontSize: "11px", padding: "5px 10px" }}
            onClick={() => setText(SAMPLE_TEXT)}>Load Sample</button>
        </div>
        <div style={{ marginTop: "14px", display: "flex", gap: "10px" }}>
          <button className="btn btn-primary" onClick={summarize} disabled={loading || !text.trim()}>
            {loading ? "Summarizing…" : "▶ Summarize"}
          </button>
          <button className="btn btn-ghost" onClick={() => { setText(""); setResult(null); setError(""); }}>Clear</button>
        </div>
      </div>

      {loading && <div className="loading-row"><div className="spinner" />Running BART summarization…</div>}
      {error && <div className="error-msg">⚠️ {error}</div>}

      {result && (
        <div className="card">
          <div className="card-title">Summary</div>
          <div className="stats-row">
            <div className="stat-chip">Original: <b>{result.original_length} words</b></div>
            <div className="stat-chip">Summary: <b>{result.summary_length} words</b></div>
            <div className="stat-chip">Compression: <b>{Math.round((1 - result.summary_length / result.original_length) * 100)}%</b></div>
          </div>
          <div className="result-box">{result.summary}</div>
        </div>
      )}
    </div>
  );
}

export default SummarizePage;
