import React, { useState, useRef } from "react";
import { apiUpload } from "../api";

export default function SpeechPage() {
  const [file, setFile]       = useState(null);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [drag, setDrag]       = useState(false);
  const inputRef              = useRef();

  function handleFile(f) {
    if (!f) return;
    setFile(f); setResult(null); setError("");
  }

  function onDrop(e) {
    e.preventDefault(); setDrag(false);
    handleFile(e.dataTransfer.files[0]);
  }

  async function transcribe() {
    if (!file) return;
    setLoading(true); setError(""); setResult(null);
    const form = new FormData();
    form.append("file", file);
    try {
      const data = await apiUpload("/transcribe", form);
      setResult(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  function copyText() {
    if (result?.transcript) navigator.clipboard.writeText(result.transcript);
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🎤 Speech Recognition</div>
        <div className="page-desc">Upload an audio file and get a full transcript. Powered by OpenAI Whisper.</div>
        <div className="model-badge">📦 openai/whisper-large-v2</div>
      </div>

      <div className="card">
        <div className="card-title">Upload Audio</div>
        <div
          className={`upload-zone ${drag ? "active" : ""}`}
          onClick={() => inputRef.current.click()}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
        >
          <div className="upload-icon">{file ? "🎵" : "🎤"}</div>
          {file ? (
            <div style={{ color: "var(--accent)" }}>{file.name}</div>
          ) : (
            <div>Drop your audio file here or click to browse</div>
          )}
          <div className="upload-hint">MP3, WAV, OGG, FLAC · Max 25MB · Multi-language</div>
        </div>
        <input ref={inputRef} type="file" accept="audio/*" hidden onChange={e => handleFile(e.target.files[0])} />

        {file && (
          <>
            <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--muted)" }}>
              📎 {file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB
            </div>
            <audio controls src={URL.createObjectURL(file)}
              style={{ width: "100%", marginTop: "10px", borderRadius: "8px", filter: "invert(1) hue-rotate(180deg)" }} />
          </>
        )}

        <div style={{ marginTop: "14px", display: "flex", gap: "10px" }}>
          <button className="btn btn-primary" onClick={transcribe} disabled={loading || !file}>
            {loading ? "Transcribing…" : "▶ Transcribe"}
          </button>
          <button className="btn btn-ghost" onClick={() => { setFile(null); setResult(null); setError(""); }}>
            Reset
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-row">
          <div className="spinner" />
          Running Whisper ASR — large files may take up to 60s…
        </div>
      )}

      {error && <div className="error-msg">⚠️ {error}</div>}

      {result && (
        <div className="card">
          <div className="card-title">Transcript</div>
          <div className="stats-row">
            <div className="stat-chip">Words: <b>{result.word_count}</b></div>
            <div className="stat-chip">Chars: <b>{result.char_count}</b></div>
            <div className="stat-chip">Model: <b>Whisper Large v2</b></div>
          </div>
          <div className="transcript-box">{result.transcript || "No speech detected."}</div>
          <div style={{ marginTop: "10px" }}>
            <button className="btn btn-ghost" style={{ fontSize: "12px" }} onClick={copyText}>
              📋 Copy Transcript
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
