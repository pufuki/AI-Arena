import React, { useState } from "react";
import { apiPost } from "../api";

const SAMPLE_CONTEXT = `The Python programming language was created by Guido van Rossum and was first released in 1991. Python emphasizes code readability and simplicity. It supports multiple programming paradigms including procedural, object-oriented, and functional programming. Python is widely used in data science, artificial intelligence, web development, and automation. The Python Software Foundation manages the language and its development.`;

const SAMPLE_QA = [
  { q: "Who created Python?", c: SAMPLE_CONTEXT },
  { q: "When was Python first released?", c: SAMPLE_CONTEXT },
  { q: "What does the Python Software Foundation do?", c: SAMPLE_CONTEXT },
];

export default function QAPage() {
  const [question, setQuestion] = useState("");
  const [context, setContext]   = useState("");
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function answer() {
    if (!question.trim() || !context.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const data = await apiPost("/qa", { question, context });
      setResult(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  function loadSample(sample) {
    setQuestion(sample.q);
    setContext(sample.c);
    setResult(null);
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">❓ Question Answering</div>
        <div className="page-desc">Provide a context passage and ask any question — the AI extracts the answer.</div>
        <div className="model-badge">📦 deepset/roberta-base-squad2</div>
      </div>

      <div className="card">
        <div className="card-title">Quick Examples</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {SAMPLE_QA.map((s, i) => (
            <button key={i} className="btn btn-ghost" style={{ fontSize: "11px", padding: "5px 12px" }}
              onClick={() => loadSample(s)}>
              "{s.q}"
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Context Passage</div>
        <textarea value={context} onChange={e => setContext(e.target.value)}
          placeholder="Paste the passage that contains the answer…" rows={6} />
      </div>

      <div className="card">
        <div className="card-title">Your Question</div>
        <input type="text" value={question} onChange={e => setQuestion(e.target.value)}
          placeholder="What do you want to know from the context?" />
        <div style={{ marginTop: "14px", display: "flex", gap: "10px" }}>
          <button className="btn btn-primary" onClick={answer}
            disabled={loading || !question.trim() || !context.trim()}>
            {loading ? "Finding answer…" : "▶ Get Answer"}
          </button>
          <button className="btn btn-ghost" onClick={() => { setQuestion(""); setContext(""); setResult(null); setError(""); }}>
            Clear
          </button>
        </div>
      </div>

      {loading && <div className="loading-row"><div className="spinner" />Running RoBERTa Q&A model…</div>}
      {error && <div className="error-msg">⚠️ {error}</div>}

      {result && (
        <div className="card">
          <div className="card-title">Answer</div>
          <div className="stats-row">
            <div className="stat-chip">Confidence: <b>{result.confidence}%</b></div>
          </div>

          <div style={{
            background: "rgba(0,229,255,0.08)",
            border: "1px solid rgba(0,229,255,0.3)",
            borderRadius: "8px",
            padding: "14px 18px",
            fontSize: "16px",
            fontWeight: "600",
            color: "var(--accent)",
          }}>
            {result.answer || "No answer found in the provided context."}
          </div>

          <div style={{ marginTop: "10px", fontSize: "12px", color: "var(--muted)" }}>
            Q: <em style={{ color: "var(--text)" }}>{result.question}</em>
          </div>
        </div>
      )}
    </div>
  );
}
