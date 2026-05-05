import React, { useState } from "react";
import { apiPost } from "../api";

const LABEL_COLORS = { PER: "PER", ORG: "ORG", LOC: "LOC", MISC: "MISC" };

const SAMPLE = "Apple Inc. was founded by Steve Jobs and Steve Wozniak in Cupertino, California in 1976. The company later opened offices in London and Tokyo under CEO Tim Cook.";

export default function NERPage() {
  const [text, setText]     = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  async function run() {
    if (!text.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const data = await apiPost("/ner", { text });
      setResult(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  // group by entity type
  const grouped = result ? result.entities.reduce((acc, e) => {
    const key = e.label.replace("B-", "").replace("I-", "");
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {}) : {};

  const LABEL_NAMES = { PER: "👤 Person", ORG: "🏢 Organization", LOC: "📍 Location", MISC: "🔖 Miscellaneous" };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🏷️ Named Entity Recognition</div>
        <div className="page-desc">Identify people, organizations, locations, and more in your text.</div>
        <div className="model-badge">📦 dslim/bert-base-NER</div>
      </div>

      <div className="card">
        <div className="card-title">Input Text</div>
        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder="Enter text with names, places, companies…" rows={5} />
        <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
          <button className="btn btn-ghost" style={{ fontSize: "11px", padding: "5px 10px" }}
            onClick={() => setText(SAMPLE)}>Load Sample</button>
        </div>
        <div style={{ marginTop: "14px", display: "flex", gap: "10px" }}>
          <button className="btn btn-primary" onClick={run} disabled={loading || !text.trim()}>
            {loading ? "Extracting…" : "▶ Extract Entities"}
          </button>
          <button className="btn btn-ghost" onClick={() => { setText(""); setResult(null); setError(""); }}>Clear</button>
        </div>
      </div>

      {loading && <div className="loading-row"><div className="spinner" />Running BERT NER model…</div>}
      {error && <div className="error-msg">⚠️ {error}</div>}

      {result && (
        <div className="card">
          <div className="card-title">Entities Found</div>
          <div className="stats-row">
            <div className="stat-chip">Total: <b>{result.count}</b></div>
            {Object.entries(grouped).map(([k, v]) => (
              <div key={k} className="stat-chip">{k}: <b>{v.length}</b></div>
            ))}
          </div>

          {result.count === 0 ? (
            <div style={{ color: "var(--muted)", fontSize: "14px" }}>No named entities found in this text.</div>
          ) : (
            Object.entries(grouped).map(([label, entities]) => (
              <div key={label} style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "8px" }}>
                  {LABEL_NAMES[label] || label}
                </div>
                <div className="ner-chips">
                  {entities.map((e, i) => (
                    <div key={i} className={`ner-chip ner-${label}`}>
                      {e.word}
                      <span>{e.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
