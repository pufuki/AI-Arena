import React, { useState, useRef } from "react";
import { apiUpload } from "../api";

export default function ImagePage() {
  const [file, setFile]       = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [drag, setDrag]       = useState(false);
  const inputRef              = useRef();

  function handleFile(f) {
    if (!f) return;
    setFile(f);
    setResult(null);
    setError("");
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  }

  function onDrop(e) {
    e.preventDefault(); setDrag(false);
    handleFile(e.dataTransfer.files[0]);
  }

  async function classify() {
    if (!file) return;
    setLoading(true); setError(""); setResult(null);
    const form = new FormData();
    form.append("file", file);
    try {
      const data = await apiUpload("/classify-image", form);
      setResult(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  const ACCENT_COLORS = [
    "var(--accent)", "var(--accent2)", "var(--success)", "var(--warn)", "#f472b6"
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🖼️ Image Classification</div>
        <div className="page-desc">Upload any image and the AI will tell you what it sees, with confidence scores.</div>
        <div className="model-badge">📦 google/vit-base-patch16-224</div>
      </div>

      <div className="card">
        <div className="card-title">Upload Image</div>
        <div
          className={`upload-zone ${drag ? "active" : ""}`}
          onClick={() => inputRef.current.click()}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
        >
          {preview ? (
            <img src={preview} alt="preview"
              style={{ maxHeight: "200px", maxWidth: "100%", borderRadius: "8px" }} />
          ) : (
            <>
              <div className="upload-icon">🖼️</div>
              <div>Drop an image here or click to browse</div>
              <div className="upload-hint">JPG, PNG, WEBP · Max 10MB</div>
            </>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={e => handleFile(e.target.files[0])} />

        {file && (
          <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--muted)" }}>
            📎 {file.name} · {(file.size / 1024).toFixed(1)} KB
          </div>
        )}

        <div style={{ marginTop: "14px", display: "flex", gap: "10px" }}>
          <button className="btn btn-primary" onClick={classify} disabled={loading || !file}>
            {loading ? "Classifying…" : "▶ Classify"}
          </button>
          <button className="btn btn-ghost" onClick={() => { setFile(null); setPreview(null); setResult(null); setError(""); }}>
            Reset
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-row">
          <div className="spinner" />
          Running Vision Transformer inference…
        </div>
      )}

      {error && <div className="error-msg">⚠️ {error}</div>}

      {result && (
        <div className="card">
          <div className="card-title">Classification Results</div>
          <div className="stats-row">
            <div className="stat-chip">Top: <b>{result.top_prediction}</b></div>
            <div className="stat-chip">Confidence: <b>{result.confidence}%</b></div>
          </div>

          <div style={{ marginBottom: "12px", fontSize: "12px", color: "var(--muted)" }}>Top 5 Predictions:</div>
          <div className="top5-list">
            {result.top5.map((item, i) => (
              <div key={i} className="top5-item">
                <span className="top5-rank">#{i + 1}</span>
                <span className="top5-label">{item.label}</span>
                <div className="top5-bar-track">
                  <div className="top5-bar-fill"
                    style={{ width: `${item.score}%`, background: `linear-gradient(90deg, ${ACCENT_COLORS[i]}, ${ACCENT_COLORS[(i+1)%5]})` }} />
                </div>
                <span className="top5-score">{item.score}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
