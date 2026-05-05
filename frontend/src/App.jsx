import React, { useState } from "react";
import "./App.css";
import HomePage        from "./pages/HomePage";
import SentimentPage   from "./pages/SentimentPage";
import GenerationPage  from "./pages/GenerationPage";
import ImagePage       from "./pages/ImagePage";
import SpeechPage      from "./pages/SpeechPage";
import SummarizePage   from "./pages/SummarizePage";
import NERPage         from "./pages/NERPage";
import TranslatePage   from "./pages/TranslatePage";
import QAPage          from "./pages/QAPage";

const NAV = [
  { id: "home",       label: "Home",         desc: "Overview & quick start"   },
  { id: "sentiment",  label: "Sentiment",    desc: "Analyze emotion in text"  },
  { id: "generation", label: "Text Gen",     desc: "AI writes for you"        },
  { id: "image",      label: "Image Class",  desc: "What's in the picture?"   },
  { id: "speech",     label: "Speech",       desc: "Transcribe audio files"    },
  { id: "summarize",  label: "Summarize",    desc: "Condense long text"        },
  { id: "ner",        label: "NER",          desc: "Find named entities"       },
  { id: "translate",  label: "Translate",    desc: "English → French"          },
  { id: "qa",         label: "Q&A",          desc: "Answer from context"       },
];

export default function App() {
  const [active, setActive] = useState("home");

  function renderPage() {
    switch (active) {
      case "home":       return <HomePage onNavigate={setActive} />;
      case "sentiment":  return <SentimentPage />;
      case "generation": return <GenerationPage />;
      case "image":      return <ImagePage />;
      case "speech":     return <SpeechPage />;
      case "summarize":  return <SummarizePage />;
      case "ner":        return <NERPage />;
      case "translate":  return <TranslatePage />;
      case "qa":         return <QAPage />;
      default:           return <HomePage onNavigate={setActive} />;
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand" onClick={() => setActive("home")} style={{ cursor: "pointer" }}>
          <span className="brand-icon"></span>
          <div>
            <div className="brand-name">AI Studio</div>
            <div className="brand-sub">8 Models · HuggingFace API</div>
          </div>
        </div>

        <div className="nav-section-label">NAVIGATION</div>
        <nav className="nav-list">
          {NAV.map((n) => (
            <button
              key={n.id}
              className={`nav-item ${active === n.id ? "active" : ""}`}
              onClick={() => setActive(n.id)}
            >
              <span className="nav-icon">{n.icon}</span>
              <div className="nav-text">
                <span className="nav-label">{n.label}</span>
                <span className="nav-desc">{n.desc}</span>
              </div>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="status-dot" />
          <span>HuggingFace API</span>
        </div>
      </aside>

      <main className="main-content">
        <div className={active === "home" ? "page-wrapper-home" : "page-wrapper"}>
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
